package controllers

import play.api._
import play.api.mvc._
import play.api.mvc.Security._
import play.api.mvc.Results._
import play.api.data._
import play.api.data.Forms._
import models._
import scala.concurrent.Future

class AuthenticatedRequest[A](val username: String, request: Request[A]) extends WrappedRequest[A](request) {
	def findShopper: Option[Shopper] = Shoppers.findShopper(username)
}

class AuthenticatedPossibleRequest[A](val username: Option[String], request: Request[A]) extends WrappedRequest[A](request) {
	def isAuthenticated = username.isDefined
	def findShopper: Option[Shopper] = username.flatMap( Shoppers.findShopper(_) )
}

trait Secured {

	def Authenticated = new ActionBuilder[AuthenticatedRequest] {
		def invokeBlock[A](request: Request[A], block: (AuthenticatedRequest[A]) => Future[SimpleResult]) = {
			request.session.get("username") match {
				case Some(username) => {	
					Shoppers.findShopper(username) match {
						case Some(shopper) => block(new AuthenticatedRequest(username, request))
						case None => throw new IllegalStateException(s"No shopper found for username: $username")
					}
				}
				case None => {
					Logger.debug("Not logged in")
					implicit val errorMessages = List(ErrorMessage("Not logged in"))
					implicit val user: Option[Shopper] = None
					Future.successful(Forbidden(views.html.login(Application.loginForm)))
				}
			}
		}
	}


	def AuthenticatedPossible = new ActionBuilder[AuthenticatedPossibleRequest] {
		def invokeBlock[A](request: Request[A], block: (AuthenticatedPossibleRequest[A]) => Future[SimpleResult]) = {
			request.session.get("username") match {
				case Some(username) => {	
					Shoppers.findShopper(username) match {
						case Some(shopper) => block(new AuthenticatedPossibleRequest( Some(username), request))
						case None => throw new IllegalStateException(s"No shopper found for username: $username")
					}
				}
				case None => {
					Logger.debug("Not logged in")
					block(new AuthenticatedPossibleRequest(None, request))
				}
			}
		}
	}  

	implicit def currentShopper[A](implicit request: AuthenticatedRequest[A]): Option[Shopper] = {        
		Some(Shopper(None,request.username))
	}

	implicit def currentPossibleShopper[A](implicit request: AuthenticatedPossibleRequest[A]): Option[Shopper] = {      
		request.username.map( Shopper(None,_) )
	}

}




object Application extends Controller with Secured {


	def index = AuthenticatedPossible { implicit authRequest =>
		if(authRequest.isAuthenticated) {
			Redirect(routes.Application.home)
		} else {
			Ok(views.html.index())
		}		
	}

	def home = Authenticated { implicit authRequest =>
		Ok(views.html.home())
	}

	def about = AuthenticatedPossible { implicit authRequest =>
		Ok(views.html.about())
	}

	def help = TODO
	def contact = TODO

	val registerFields = mapping (
		"username" -> text,
		"password" -> text,
		"confirmPassword" -> text
	)(RegisterDetails.apply)(RegisterDetails.unapply) verifying("Passwords does not match", fields => fields match {
		case registerDetails => registerDetails.password == registerDetails.confirmPassword
	})

	val registerForm = Form( registerFields )

	def viewRegister = AuthenticatedPossible { implicit authRequest =>
		Ok(views.html.register(registerForm))
	}

	def register = Action { implicit request =>
		registerForm.bindFromRequest.fold(
			errors => {
				Logger.warn("Registration form error")
				BadRequest(views.html.register(errors))
			},
			registerDetails => {
				Shoppers.findShopper(registerDetails.username) match {
					case Some(shopper) => {
						Logger.warn(s"Registration failed. Username taken: ${registerDetails.username}")
						implicit val errorMessages = List(ErrorMessage("Registration failed. The username is already taken"))
						BadRequest(views.html.register(registerForm.fill(registerDetails)))
					}
					case None => {
						registerDetails.register
						Redirect(routes.Application.home).withSession("username" -> registerDetails.username)						
					}
				}
			}
    	)
	}	

	val loginFields = mapping(
		"username" -> text,
		"password" -> text
	)(LoginDetails.apply)(LoginDetails.unapply)

	val loginForm = Form( loginFields )

	def viewLogin = AuthenticatedPossible { implicit authRequest =>
		Ok(views.html.login(loginForm))
	}

	def login = Action { implicit request =>
		loginForm.bindFromRequest.fold(
			errors => {
				Logger.warn("Login form error")
				BadRequest(views.html.login(errors))
			},
			loginDetails => {
				Authentication.authenticate(loginDetails) match {
					case Some(shopper) => {

						Redirect(routes.Application.home).withSession("username" -> loginDetails.username)

					}
					case None => {
						Logger.warn(s"Authentication failed for ${loginDetails.username}")
						implicit val errorMessages = List(ErrorMessage(
							"Authentication failed. Either the user does not exist or the password is incorrect"))
						BadRequest(views.html.login(loginForm.fill(loginDetails)))
					}
				}
			}
    	)
	}

	def logout = AuthenticatedPossible { implicit authRequest =>
		Logger.debug(s"Logging out: ${authRequest.username}")
		Redirect(routes.Application.index).withNewSession
	}

}
