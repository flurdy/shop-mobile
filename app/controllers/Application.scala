package controllers

import play.api._
import play.api.mvc._

object Application extends Controller {
  
  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }
  
}
package controllers

import play.api.data._
import play.api.mvc._
import models._
import views._

object Application extends Controller {

  val shoppingList = List(
    new ShoppingItem("Bread","Brown,sliced"),
    new ShoppingItem("Milk","2l Skimmed"),
    new ShoppingItem("Wholemeal rice"," jasminjasmin jasmin jasmin  jasminjasminjasminjasminjasminjasmin jasmin jasmin jasminjasmin jasmin"),
    new ShoppingItem("Cookie",""))

  def index = Action {
    Ok(views.html.index(shoppingList))
  }

  val buyItemForm = Form {
    of(
      "itemId" -> text
    )
  }

  def buyItem = Action {
    Ok(views.html.index(shoppingList))
  }


}