package controllers

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import models._
import views._
import play.Logger
import anorm._
import collection.mutable.HashMap

object Application extends Controller {

  val loginForm = Form(
    tuple(
      "username" -> text(minLength = 2),
      "password" -> text
    ) verifying ("Invalid username? Perhaps register first?", result => result match {
      case (username, password) => Shopper.authenticate(username, password).isDefined
    })
  )

  val registerForm = Form(
    mapping(
      "username" -> text,
      "password" -> text
    ) (Shopper.apply)(Shopper.unapply)
      verifying ("Username taken or invalid", result => result match {
        case (shopper) => !Shopper.findByUsername(shopper.username).isDefined
    })
  )

  def redirectToIndex = Action {
    Redirect(routes.ShoppingListController.index())
  }

  def showLogin(message:String="") = Action { implicit request =>
    Ok(html.login(loginForm,registerForm,message))
  }

  def authenticate = Action { implicit request =>
    loginForm.bindFromRequest.fold(
      formWithErrors => {
        Logger.warn("Log in failed" )
        BadRequest(html.login(formWithErrors,registerForm,"Log in failed"))
      },
      user => {
        Logger.info("Logging in" )
        Redirect(routes.ShoppingListController.index).withSession("username" -> user._1)
      }        
    )
  }

  def register = Action { implicit request =>
    registerForm.bindFromRequest.fold(
      formWithErrors => {
        Logger.warn("Register failed" )
        BadRequest(html.login(loginForm,formWithErrors,"Registration failed"))
      },
      shopper => {
        Logger.info("Registering" )
        Shopper.create(shopper)
        Redirect(routes.Application.showLogin("Registered. Please log in"))
      }
    )
  }

  def logout = Action {
    Redirect(routes.Application.showLogin("You've been logged out")).withNewSession.flashing(
      "success" -> "You've been logged out"
    )
  }
}


trait SecureShopper {

  private def username(request: RequestHeader) = request.session.get("username")

  private def onUnauthorised(request: RequestHeader) =
        Results.Redirect(routes.Application.showLogin("Not authorised"))

  def IsAuthenticated(f: => String => Request[AnyContent] => Result) = {
    Security.Authenticated(username, onUnauthorised) { shopper =>
      Action(request => f(shopper)(request))
    }
  }

}