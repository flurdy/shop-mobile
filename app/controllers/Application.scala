package controllers

import play.api.data._
import play.api.mvc._
import play.api.data.Forms._
import models._
import views._
import play.Logger

object Application extends Controller {

  var shoppingList = List(
    new ShoppingItem("Bread","Brown,sliced"),
    new ShoppingItem("Milk","2l Skimmed"),
    new ShoppingItem("Wholemeal rice"," jasminjasmin jasmin jasmin  jasminjasminjasminjasminjasminjasmin jasmin jasmin jasminjasmin jasmin"),
    new ShoppingItem("Cookie",""))

  def index = Action {
    Ok(views.html.index(shoppingList,addItemForm))
  }

  val addItemForm: Form[ShoppingItem] = Form(
    mapping(
      "name" -> text(minLength = 1),
      "description" -> text
   )(ShoppingItem.apply)(ShoppingItem.unapply)
  )

  def addItemToList = Action { implicit request =>
    addItemForm.bindFromRequest.fold(
      errors => {
        Logger.warn("Adding failed: "+errors)
        BadRequest(html.index(shoppingList,errors))
      },
      shoppingItem => {
        shoppingList ::= shoppingItem
        Redirect(routes.Application.index())
      }
    )
  }

  def removeItemFromList = TODO

  def putItemInBasket = TODO

  /*
  val buyItemForm = Form {
    mapping(
      "itemId" -> text
    )
  }

  def buyItem(id: Long) = Action {
    ShoppingItem.findById(id)
  }
  */

}