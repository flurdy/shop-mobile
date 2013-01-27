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
import notifiers.EmailNotifier


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


  def showItem(itemId: Long) = IsAuthenticated { username => implicit request =>
    Logger.info("View show item")
    val shoppingItem = ShoppingList.findItemById(username, itemId)
    shoppingItem match {
      case None =>  NotFound
      case Some(item) =>  Ok(views.html.shopping.item(item,itemForm))
    }
  }


  def updateItem(itemId: Long) = IsAuthenticated { username => implicit request =>
    itemForm.bindFromRequest.fold(
      errors => {
        Logger.warn("Updating failed: "+errors)
        ShoppingList.findItemById(username, itemId) match {
          case None =>  BadRequest(html.shopping.item(null,errors))
          case Some(item) => BadRequest(html.shopping.item(item,errors))
        }
      },
      shoppingItem => {
        ShoppingList.findItemById(username, itemId) match {
          case None =>  BadRequest(html.shopping.item(null,itemForm))
          case Some(item) => {
              ShoppingList.updateItem(username,new ShoppingItem(item.id,shoppingItem,item.listId))
              Redirect(routes.ShoppingListController.index())
          } 
        }   
      }
    )
  }


  def removeItem(itemId: Long) =  IsAuthenticated { username => implicit request =>
    ShoppingList.removeItem(username,itemId)
    Redirect(routes.ShoppingListController.purchased())
  }


  def purchaseItem(itemId: Long) = IsAuthenticated { username => implicit request =>
    ShoppingList.purchaseItem(username,itemId)
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



  def showShareListOptions = IsAuthenticated { username => implicit request =>
    Ok(views.html.share.options())
  }

  def shareListByEmail = IsAuthenticated { username => implicit request =>
    ShoppingList.findListByUsername(username).map { shoppingList =>
      EmailNotifier.shareByEmail(shoppingList)
    }
    Redirect(routes.ShoppingListController.index()).flashing("message"->"List shared by email")
  }

  def shareListBySms = IsAuthenticated { username => implicit request =>
    NotImplemented//(routes.ShoppingListController.index()).flashing("message"->"List shared by sms")
  }

}

