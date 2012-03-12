package models

import play.api.Play.current
import play.api.db.DB
import anorm._
import anorm.SqlParser._
import play.Logger


case class ShoppingList(id:Pk[Long]){
  var list:Seq[ShoppingItem] = List()
  //  def this(){
  //    this(NotAssigned)
  //  }
  def this(id:Pk[Long],newList:Seq[ShoppingItem])  {
    this(id)
    this.list = newList
    //reorderListByPurchased
  }
  //def reorderListByPurchased {
  // list.filter { item => !item.isPurchased } ++ list.filter { item => item.isPurchased }
  //   list = ShoppingList.findItems(username)
  //}

  def addItem(shoppingItem:ShoppingItem) = {
    //Logger.error("List id is " + id.getOrElse( throw new IllegalArgumentException("List ID NULL:"+id) ))
//    Logger.error("Item List id is " + shoppingItem.listId.getOrElse( throw new IllegalArgumentException("Item list ID NULL:"+shoppingItem.listId) ))
    val itemFind = findItem(shoppingItem.name)
    itemFind match {
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
  def findItem(name: String): Option[ShoppingItem] = {
    val itemsFound = DB.withConnection { implicit connection =>
      SQL("select * from shoppingitem " +
        "where itemname = {name}" +
        " and listid = {listid}").on(
        'name -> name,
        'listid -> id
      ).as(ShoppingItem.simple *)
    }
    if( itemsFound.isEmpty )  {
      Logger.info("No item found")
      None
    } else
      Some(itemsFound.head)
  }
}

object ShoppingList {

  val simple = {
    get[Pk[Long]]("shoppinglist.id") map {
      case id => ShoppingList(id)
    }
  }

  def findItem(username: String, name: String): Option[ShoppingItem] = {
    // val itemFind = list.find{ item => item.name == name }
    val itemsFound = DB.withConnection { implicit connection =>
      SQL("select * from shoppingitem where itemname = {name}").on(
        'name -> name
      ).as(ShoppingItem.simple *)
    }
    if( itemsFound.isEmpty )  {
      Logger.info("No item found")
      None
    } else
      Some(itemsFound.head)
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
    val itemFind = list.findItem(shoppingItem.name)
    itemFind match {
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
    // list = list.map { case i => if (i.name == shoppingItem.name) shoppingItem else i }
    ShoppingItem.update(shoppingItem)
  }
  def removeItem(username: String, itemName: String):ShoppingItem = {
    val itemFound = ShoppingList.findItem(username,itemName)
    itemFound match {
      case None =>  sys.error("Item not on list")
      case Some(item) => {
        ShoppingItem.delete(itemName)
        //list = ShoppingList.findItems(username)
        item
      }
    }
  }
  def purchaseItem(username: String,itemName: String) {
    val itemFound = ShoppingList.findItem(username,itemName)
    itemFound match {
      case None =>  sys.error("Item not on list")
      case Some(item) => {
        ShoppingItem.storeAsPurchased(username,itemName)
      }
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
