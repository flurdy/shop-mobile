package models

import play.api.Play.current
import play.api.db.DB
import anorm._
import anorm.SqlParser._
import play.Logger


case class ShoppingList(id:Pk[Long]){
  var list:Seq[ShoppingItem] = List()
  def this(id:Pk[Long],newList:Seq[ShoppingItem])  {
    this(id)
    this.list = newList
  }

  def addItem(shoppingItem:ShoppingItem):ShoppingItem = {
    findItemByName(shoppingItem.name) match {
      case None =>  {
        Logger.info("Creating new shopping item:"+shoppingItem.name)
        ShoppingItem.create(
          new ShoppingItem(
            shoppingItem.name,
            shoppingItem.description,
            shoppingItem.isPurchased,
            id))
      }
      case Some(item) => {
        Logger.warn("Unique name required")
        item.markAsNotPurchased
        ShoppingItem.update(item)
      }
    }
  }

  def findItemByName(itemName: String): Option[ShoppingItem] = {
    ShoppingList.findItemByNameAndListId(id.get,itemName)
  }

  def findItemById(itemId: Long): Option[ShoppingItem] = {
    ShoppingList.findItemByIdAndListId(itemId,id.get)
  }

//  def findItemById(itemId:Pk[Long]): Option[ShoppingItem] = {
//    DB.withConnection { implicit connection =>
//      SQL("select * from shoppingitem " +
//        "where id = {id}" +
//        " and listid = {listid}").on(
//        'id -> itemId.get,
//        'listid -> id
//      ).as(ShoppingItem.simple.singleOpt)
//    }
//  }

  def purchaseItem(itemId: Long) {
    findItemById(itemId) match {
      case None =>  throw new IllegalArgumentException("Item not on list")
      case Some(item) => {
        item.storeAsPurchased
      }
    }
  }
  def removeItem(itemId: Long):ShoppingItem = {
    findItemById(itemId) match {
      case None => throw new IllegalArgumentException("Item not found")
      case Some(item) => {
        ShoppingItem.delete(item.id)
        item
      }
    }
  }

  def findItems: Seq[ShoppingItem] = {
    DB.withConnection { implicit connection =>
      SQL(
        """
          select si.* from shoppinglist sl
          inner join shoppingitem si on sl.id = si.listid
          where sl.id = {listid}
          order by si.ispurchased,si.itemname
        """
      ).on(
       'listid -> id
      ).as(ShoppingItem.simple *)
    }
  }

  def fetchItems = {
    list = findItems
  }

}

object ShoppingList {

  val simple = {
    get[Pk[Long]]("shoppinglist.id") map {
      case id => ShoppingList(id)
    }
  }

  def findItemByName(username: String, itemName: String): Option[ShoppingItem] = {
    findListByUsername(username).get.findItemByName(itemName)
  }

  def findItemById(username: String, itemId: Long): Option[ShoppingItem] = {
    findListByUsername(username).get.findItemById(itemId)
  }

  def findItemByNameAndListId(listId:Long, itemName:String): Option[ShoppingItem] = {
    DB.withConnection { implicit connection =>
      SQL("select * from shoppingitem " +
        "where itemname = {name}" +
        " and listid = {listid}").on(
        'name -> itemName,
        'listid -> listId
      ).as(ShoppingItem.simple.singleOpt)
    }
  }

  def findItemByIdAndListId(itemId:Long, listId:Long): Option[ShoppingItem] = {
    DB.withConnection { implicit connection =>
      SQL("select * from shoppingitem " +
        "where id = {itemid}" +
        " and listid = {listid}").on(
        'itemid -> itemId,
        'listid -> listId
      ).as(ShoppingItem.simple.singleOpt)
    }
  }

  def findItemsByUsername(username: String): Seq[ShoppingItem] = {
    findListByUsername(username) match {
      case None => {
        Logger.warn("User does not have a list:"+username)
        throw new IllegalStateException("User does not have a list")
      }
      case Some(list) => list.findItems
    }
  }

  def findListByUsername(username: String): Option[ShoppingList] = {
    DB.withConnection { implicit connection =>
      SQL(
        """
          select id from shoppinglist
           where username = {username}
        """
      ).on( 'username -> username).as(ShoppingList.simple.singleOpt)
    } match {
      case None => None
      case Some(list) => {
        list.fetchItems
        Option(list)
      }
    }
  }

  def addItem(username: String, shoppingItem:ShoppingItem) {
    val list = findListByUsername(username).get
    list.findItemByName(shoppingItem.name) match {
      case None =>  list.addItem(shoppingItem)
      case Some(item) => {
        Logger.warn("Unique name required")
        item.markAsNotPurchased
        ShoppingItem.update(item)
      }
    }
  }
  def updateItem(username:String, shoppingItem:ShoppingItem) {
    val list = findListByUsername(username).get
    list.findItemById(shoppingItem.id.get) match {
      case None => throw new IllegalStateException("Item not on list")
      case Some(item) => ShoppingItem.update(shoppingItem)
    }
  }

  def removeItem(username: String, itemId: Long):ShoppingItem = {
    val list = findListByUsername(username).get
    list.removeItem(itemId)
  }

  def purchaseItem(username: String, itemId: Long) {
    val list = findListByUsername(username).get
    list.findItemById(itemId) match {
      case None =>  throw new IllegalArgumentException("Item not on list")
      case Some(item) => item.storeAsPurchased
    }
  }

  def createList(username:String) = {
    DB.withConnection { implicit connection =>
      SQL("insert into shoppinglist(username)" +
        " values ({username})").on(
        'username -> username
      ).executeInsert()
      findListByUsername(username)
    }
  }
}
