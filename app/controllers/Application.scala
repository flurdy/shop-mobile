package controllers

import play.api._
import play.api.mvc._
import models._

object Application extends Controller {
  
  def index = Action {
    val shoppingList = List(new ShoppingItem("Bread","Brown,sliced"),new ShoppingItem("Milk","2l Skimmed"),new ShoppingItem("Cookie",""));
    Ok(views.html.index(shoppingList));
  }
  
}