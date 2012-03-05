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
      "username" -> text,
      "password" -> text
    ) verifying ("Invalid username", result => result match {
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

  def showLogin = Action { implicit request =>
    Ok(html.login(loginForm,registerForm))
  }

  def authenticate = Action { implicit request =>
    loginForm.bindFromRequest.fold(
      formWithErrors => {
        Logger.warn("Log in failed" )
        BadRequest(html.login(formWithErrors,registerForm))
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
        BadRequest(html.login(loginForm,formWithErrors))
      },
      shopper => {
        Logger.info("Registering" )
        Shopper.create(shopper)
        Redirect(routes.Application.showLogin)
      }
    )
  }

  def logout = Action {
    Redirect(routes.Application.showLogin).withNewSession.flashing(
      "success" -> "You've been logged out"
    )
  }
}


trait SecureShopper {

  private def username(request: RequestHeader) = request.session.get("username")

  private def onUnauthorized(request: RequestHeader) = Results.Redirect(routes.Application.showLogin)

  def IsAuthenticated(f: => String => Request[AnyContent] => Result) = {
    Security.Authenticated(username, onUnauthorized) { shopper =>
      Action(request => f(shopper)(request))
    }
  }

}