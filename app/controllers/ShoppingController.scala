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
import com.sun.xml.internal.bind.v2.model.core.NonElement
import com.sun.xml.internal.ws.resources.SoapMessages


object ShoppingItemController extends Controller with SecureShopper {

  val ValidItemName = """^[a-zA-Z0-9\-\., ']*$""".r

  val itemForm: Form[ShoppingItem] = Form(
    mapping(
       "id" -> ignored(NotAssigned:Pk[Long]),
        "name" -> nonEmptyText(minLength=1,maxLength = 128),
        "description" -> text(maxLength = 500),
        "isPurchased" -> boolean,
        "listId" -> ignored(NotAssigned:Pk[Long])
      )(ShoppingItem.apply)(ShoppingItem.unapply)
    )




  def addItem =  IsAuthenticated { username => implicit request =>
    itemForm.bindFromRequest.fold(
      errors => {
        Logger.warn("Adding failed: "+errors)
        BadRequest(html.shopping.index(ShoppingList.findListByUsername(username).get,errors))
      },
      shoppingItem => {
        ValidItemName findFirstIn shoppingItem.name match {
          case None => {
            Logger.warn("Invalid name: "+shoppingItem.name)
            BadRequest(html.shopping.index(ShoppingList.findListByUsername(username).get,itemForm.fill(shoppingItem))).flashing("message"->"Invalid name")
          }
          case Some(_) => {
            ShoppingList.addItem(username,new ShoppingItem(shoppingItem))
            Redirect(routes.ShoppingListController.index())
          }
        }
      }
    )
  }


  def showItem(name: String) = IsAuthenticated { username => implicit request =>
    Logger.info("View show item")
    val shoppingItem = ShoppingList.findItemByName(username, name)
    shoppingItem match {
      case None =>  NotFound
      case Some(item) =>  Ok(views.html.shopping.item(item,itemForm))
    }
  }


  def updateItem(itemName: String) = IsAuthenticated { username => implicit request =>
    itemForm.bindFromRequest.fold(
      errors => {
        Logger.warn("Updating failed: "+errors)
        ShoppingList.findItemByName(username, itemName) match {
          case None =>  BadRequest(html.shopping.item(null,errors))
          case Some(item) => BadRequest(html.shopping.item(item,errors))
        }
      },
      shoppingItem => {
        ShoppingList.findItemByName(username, itemName) match {
          case None =>  BadRequest(html.shopping.item(null,itemForm))
          case Some(item) => {
              ShoppingList.updateItem(username,new ShoppingItem(item.id,shoppingItem,item.listId))
              Redirect(routes.ShoppingListController.index())
          } 
        }   
      }
    )
  }


  def removeItem(itemname: String) =  IsAuthenticated { username => implicit request =>
    ShoppingList.removeItem(username,itemname)
    Redirect(routes.ShoppingListController.purchased())
  }


  def purchaseItem(itemName: String) = IsAuthenticated { username => implicit request =>
    ShoppingList.purchaseItem(username,itemName)
    Redirect(routes.ShoppingListController.index())
  }

}


object ShoppingListController extends Controller with SecureShopper {

  //var shoppingList : ShoppingList = new ShoppingList(ShoppingList.findItems);

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


  def index = IsAuthenticated {  username => implicit request =>
    //Shopper.findByUsername(username).map { shopper =>
      Ok(views.html.shopping.index(ShoppingList.findListByUsername(username).get,ShoppingItemController.itemForm))
    //}.getOrElse(Forbidden)
  }



  def showMultipleItemsForm = IsAuthenticated {  username => implicit request =>
    Logger.info("View multiple")
    Ok(views.html.shopping.multiple(multipleItemForm))
  }

  def addMultipleItems = IsAuthenticated {  username => implicit request =>
    multipleItemForm.bindFromRequest.fold(
      errors => {
        Logger.warn("Adding multiplefailed: "+errors)
        BadRequest(html.shopping.multiple(errors))
      },
      multipleItems => {
        Logger.info("post multiple")
        val potentialItems = new HashMap[String,ShoppingItem]
        val items = multipleItems.split("\\r?\\n+")
        items.foreach { itemName:String =>
          if( itemName.trim != "" && !potentialItems.contains(itemName.trim)){
            potentialItems += itemName -> new ShoppingItem(itemName.trim)
          }
        }
        if(items.size > potentialItems.size ){
          BadRequest(html.shopping.multiple(multipleItemForm.fill(multipleItems)))
        } else {
          for ( (potentialName,potentialItem) <- potentialItems){
            ShoppingList.addItem(username,potentialItem)
//            val itemFound = ShoppingList.findItemByName(username,potentialName)
//            itemFound match {
//              case None =>  ShoppingList.addItem(username,potentialItem)
//              case Some(item) => {
//                Logger.warn("Item already exists")
//                item.markAsNotPurchased
//                ShoppingList.updateItem(username,item)
//              }
//            }
          }
          Redirect(routes.ShoppingListController.index())
        }
      }
    )
  }

  def showPopularItemsForm = IsAuthenticated {  username => _ =>
    val namesOnTheList = ShoppingList.findItemsByUsername(username).map { item => item.name }
    val popularItemsLeft = popularItems.filter { item => {
      ! namesOnTheList.exists( name => item.name == name )
    } }
    Ok(views.html.shopping.popular(popularItemsLeft))
  }

  def purchased =  IsAuthenticated {  username => implicit request =>
    //Shopper.findByUsername(username).map { shopper =>
      Ok(views.html.shopping.purchased(ShoppingList.findListByUsername(username).get,ShoppingItemController.itemForm))
    //}.getOrElse(Forbidden)
  }

}