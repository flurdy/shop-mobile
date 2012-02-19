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
      "name" -> text(minLength = 2),
      "description" -> text
   )(ShoppingItem.apply)(ShoppingItem.unapply)
  )

  def addItemToList = Action { implicit request =>
    addItemForm.bindFromRequest.fold(
      errors => {
        Logger.warn("!!!"+errors)
        Logger.debug("####1#"+shoppingList)
        BadRequest(html.index(shoppingList,errors))
      },
      shoppingItem => {
        Logger.debug("####0#"+shoppingItem)
        Logger.debug("####1#"+shoppingList)
        shoppingList ::= shoppingItem
        Logger.debug("####2#"+shoppingList)
        Ok(html.index(shoppingList,addItemForm))
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