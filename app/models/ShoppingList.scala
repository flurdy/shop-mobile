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
    DB.withConnection { implicit connection =>
      SQL("select * from shoppingitem " +
        "where itemname = {name}" +
        " and listid = {listid}").on(
        'name -> itemName,
        'listid -> id
      ).as(ShoppingItem.simple.singleOpt)
    }
  }

  def findItemById(itemId:Pk[Long]): Option[ShoppingItem] = {
    DB.withConnection { implicit connection =>
      SQL("select * from shoppingitem " +
        "where itemname = {name}" +
        " and listid = {listid}").on(
        'id -> itemId.get,
        'listid -> id
      ).as(ShoppingItem.simple.singleOpt)
    }
  }

  def purchaseItem(itemName: String) {
    findItemByName(itemName) match {
      case None =>  throw new IllegalArgumentException("Item not on list")
      case Some(item) => {
        item.storeAsPurchased
      }
    }
  }
  def removeItem(itemName: String):ShoppingItem = {
    findItemByName(itemName) match {
      case None => throw new IllegalArgumentException("Item not found")
      case Some(item) => {
        ShoppingItem.delete(item.id)
        item
      }
    }
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

  def findItemsByUsername(username: String): Seq[ShoppingItem] = {
    // TODO: check if username exists
    DB.withConnection { implicit connection =>
      SQL(
        """
          select si.* from shoppinglist sl
           inner join shoppingitem si on sl.id = si.listid
           where sl.username = {username}
          order by sl.id,si.ispurchased,si.itemname

        """
      ).on( 'username -> username).as(ShoppingItem.simple *)
    }
  }

  def findListByUsername(username: String): Option[ShoppingList] = {
    //Option(new ShoppingList( findItemsByUsername(username) ))
    val listFound =DB.withConnection { implicit connection =>
      SQL(
        """
          select sl.id from shoppinglist sl
           where sl.username = {username}
        """
      ).on( 'username -> username).as(ShoppingList.simple.single)
    }
    Option(new ShoppingList(listFound.id,findItemsByUsername(username)))
  }

  def addItem(username: String, shoppingItem:ShoppingItem) {
    val list = findListByUsername(username).get
    list.findItemByName(shoppingItem.name) match {
      case None =>  list.addItem(shoppingItem)
      case Some(item) => {
        Logger.warn("Unique name required")
        //val existingItem = removeItem(shoppingItem.name)
        item.markAsNotPurchased
        ShoppingItem.update(item)
      }
    }
    //list = ShoppingList.findItems(username)
  }
  def updateItem(username: String,shoppingItem:ShoppingItem) {
    val list = findListByUsername(username).get
    list.findItemById(shoppingItem.id) match {
      case None => throw new IllegalStateException("Item not on list")
      case Some(item) => ShoppingItem.update(shoppingItem)
    }
  }

  def removeItem(username: String, itemName: String):ShoppingItem = {
    val list = findListByUsername(username).get
    list.removeItem(itemName)
  }

  def purchaseItem(username: String,itemName: String) {
    val list = findListByUsername(username).get
    list.findItemByName(itemName) match {
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
