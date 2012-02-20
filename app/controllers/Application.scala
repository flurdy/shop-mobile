package controllers

import play.api.data._
import play.api.mvc._
import play.api.data.Forms._
import models._
import views._
import play.Logger

object Application extends Controller {

  var shoppingList : List[ShoppingItem] = List(
    new ShoppingItem("Bread","Brown,sliced"),
    new ShoppingItem("Milk","2l Skimmed",true),
    new ShoppingItem("Wholemeal rice"," jasminjasmin jasmin jasmin  jasminjasminjasminjasminjasminjasmin jasmin jasmin jasminjasmin jasmin"),
    new ShoppingItem("Cookie",""))

  def index = Action {
    Ok(views.html.index(shoppingList,itemForm))
  }

  def redirectToIndex = Action {
    Redirect(routes.Application.index())
  }

  val itemForm: Form[ShoppingItem] = Form(
    mapping(
      "name" -> text(minLength = 1,maxLength = 128),
      "description" -> text(maxLength = 500),
      "isPurchased" -> boolean
    )(ShoppingItem.apply)(ShoppingItem.unapply)
  )

  def addItem = Action { implicit request =>
    itemForm.bindFromRequest.fold(
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

  def showItem(name: String) = Action {
    val shoppingItem: ShoppingItem = findShoppingItem(name)
    Ok(views.html.item(shoppingItem))
  }

  def updateItem(name: String) = Action { implicit request =>
    itemForm.bindFromRequest.fold(
      errors => {
        Logger.warn("Updating failed: "+errors)
        BadRequest(html.index(shoppingList,errors))
      },
      shoppingItem => {
        shoppingList = shoppingList.map { case i => if (i.name == name) shoppingItem else i }
        Redirect(routes.Application.index())
      }
    )
  }

  def removeItem(name: String) = Action {
    shoppingList = shoppingList.filter { item => item.name != name }
    Redirect(routes.Application.index())
  }

  def purchaseItem(name: String) = Action {
    val shoppingItem: ShoppingItem = findShoppingItem(name)
    shoppingItem.markAsPurchased
    Redirect(routes.Application.index())
  }

  def findShoppingItem(name: String): ShoppingItem = {
    val itemFind = shoppingList.find{ item => item.name == name }
    itemFind match {
      case None =>  error("No item found")
      case Some(item) => item
    }
  }


}