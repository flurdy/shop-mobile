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

  // List(
//    new ShoppingItem("Bread","Brown,sliced"),
//    new ShoppingItem("Milk","2l Skimmed",true),
//    new ShoppingItem("Wholemeal rice"," jasminjasmin jasmin jasmin  jasminjasminjasminjasminjasminjasmin jasmin jasmin jasminjasmin jasmin"),
//    new ShoppingItem("Cookie","")))

  def index = Action {
    Ok(views.html.index(ShoppingListController.shoppingList,ShoppingItemController.itemForm))
  }

  def redirectToIndex = Action {
    Redirect(routes.Application.index())
  }


}