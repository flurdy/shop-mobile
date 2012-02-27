package controllers

import play.api._
import mvc.Action._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import models._
import views._
import play.Logger
import anorm._
import views.html
import collection.mutable.HashMap

object ShoppingItemController extends Controller {

  val itemForm: Form[ShoppingItem] = Form(
    mapping(
      "name" -> nonEmptyText(maxLength = 128),
      "description" -> text(maxLength = 500),
      "isPurchased" -> boolean,
      "listId" -> ignored(NotAssigned:Pk[Long])
    )(ShoppingItem.apply)(ShoppingItem.unapply)
  )



  def addItem = Action { implicit request =>
    itemForm.bindFromRequest.fold(
      errors => {
        Logger.warn("Adding failed: "+errors)
        BadRequest(html.index(ShoppingListController.shoppingList,errors))
      },
      shoppingItem => {
        ShoppingListController.shoppingList.addItem(shoppingItem)
        Redirect(routes.Application.index())
      }
    )
  }


  def showItem(name: String) = Action {
    Logger.info("View show item")
    val shoppingItem = ShoppingList.findItem(name)
    shoppingItem match {
      case None =>  NotFound
      case Some(item) =>  Ok(views.html.item(item,itemForm))
    }
  }


  def updateItem(name: String) = Action { implicit request =>
    itemForm.bindFromRequest.fold(
      errors => {
        Logger.warn("Updating failed: "+errors)
        val shoppingItem = ShoppingList.findItem(name)
        shoppingItem match {
          case None =>  BadRequest(html.item(null,errors))
          case Some(item) => BadRequest(html.item(item,errors))
        }
      },
      shoppingItem => {
        ShoppingListController.shoppingList.updateItem(name,shoppingItem)
        Redirect(routes.Application.index())
      }
    )
  }


  def removeItem(name: String) = Action {
    ShoppingListController.shoppingList.removeItem(name)
    Redirect(routes.Application.index())
  }


  def purchaseItem(name: String) = Action {
    ShoppingListController.shoppingList.purchaseItem(name)
    Redirect(routes.Application.index())
  }

}


object ShoppingListController extends Controller {

  var shoppingList : ShoppingList = new ShoppingList(ShoppingList.findItems);

  val popularItems = List(
    new ShoppingItem("Bread","Brown,sliced"),
    new ShoppingItem("Milk","2l Skimmed"),
    new ShoppingItem("Peppers"),
    new ShoppingItem("Tomatoes"),
    new ShoppingItem("Orange Juice"),
    new ShoppingItem("Rice"),
    new ShoppingItem("Dinners"),
    new ShoppingItem("Spaghetti") )

  val multipleItemForm: Form[String] = Form(
    "items" -> nonEmptyText(maxLength = 1500)
  )

  def showMultipleItemsForm = Action {
    Logger.info("View multiple")
    Ok(views.html.multiple(multipleItemForm))
  }

  def addMultipleItems = Action { implicit request =>
    multipleItemForm.bindFromRequest.fold(
      errors => {
        Logger.warn("Adding multiplefailed: "+errors)
        BadRequest(html.multiple(errors))
      },
      multipleItems => {
        Logger.info("post multiple")
        val potentialItems = new HashMap[String,ShoppingItem]
        var items = multipleItems.split("\\r?\\n+")
        items.foreach { name:String =>
          if( name.trim != "" && !potentialItems.contains(name.trim)){
            potentialItems += name -> new ShoppingItem(name.trim)
          }
        }
        if(items.size > potentialItems.size ){
          BadRequest(html.multiple(multipleItemForm.fill(multipleItems)))
        } else {
          for ( (name,potentialItem) <- potentialItems){
            val itemFound = ShoppingList.findItem(name)
            itemFound match {
              case None =>  shoppingList.addItem(potentialItem)
              case Some(item) => {
                Logger.warn("Item already exists")
                item.markAsNotPurchased
                shoppingList.updateItem(name,item)
              }
            }
          }
          Redirect(routes.Application.index())
        }
      }
    )
  }

  def showPopularItemsForm = Action {
    val namesOnTheList = shoppingList.list.map { item => item.name }
    val popularItemsLeft = popularItems.filter { item => {
      ! namesOnTheList.exists( name => item.name == name )
    } }
    Ok(views.html.popular(popularItemsLeft))
  }


}