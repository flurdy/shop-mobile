package models

import play.api.Play.current
import play.Logger
import play.api.db._
import anorm._
import anorm.SqlParser._
import scala.Some._


case class ShoppingItem(name: String, description:
    String, var isPurchased: Boolean, listId: Pk[Long] = NotAssigned){
  def this(name: String){
    this(name,"",false,null)
  }
  def this(name: String, description: String){
    this(name,description,false,null)
  }
  def markAsPurchased {
    isPurchased = true
//    ShoppingItem.storeAsPurchased(name)
  }
  def markAsNotPurchased {
    isPurchased = false
  }
}

object ShoppingItem {
  val simple = {
    get [String]("name") ~
    get [String]("description") ~
    get [Boolean]("isPurchased") map {
    // get [Pk[Long]]("listId")

      case name~description~isPurchased => ShoppingItem(name,description,isPurchased)
    }
  }
  def create(item: ShoppingItem): Unit = {
    DB.withConnection { implicit connection =>
      SQL("insert into ShoppingItem(name,description,isPurchased)" +
        " values ({name},{description},{isPurchased})").on(
        'name -> item.name,
        'description -> item.description,
        'isPurchased -> item.isPurchased
      ).executeInsert()
//      // 'listId -> item.listId
    }
  }
  def update(formerName: String,item: ShoppingItem): Unit = {
    DB.withConnection { implicit connection =>
      SQL("update ShoppingItem " +
        "set name={name}," +
        "description={description}," +
        "isPurchased={isPurchased}" +
        " where name = {formerName}").on(
        'name -> item.name,
        'description -> item.description,
        'isPurchased -> item.isPurchased,
        'formerName -> formerName
      ).executeUpdate()
    }
  }
  def storeAsPurchased(formerName: String): Unit = {
    DB.withConnection { implicit connection =>
      SQL("update ShoppingItem " +
        "set isPurchased=true" +
        " where name = {formerName}").on(
        'formerName -> formerName
      ).executeUpdate()
    }
  }
  def delete(name: String): Unit = {
    DB.withConnection { implicit connection =>
      SQL("delete from ShoppingItem " +
        " where name = {name}").on(
        'name -> name
      ).execute()
    }
  }
}


case class ShoppingList(){
  var list:Seq[ShoppingItem] = List()
  def this(newList:Seq[ShoppingItem])  {
    this()
    this.list = newList
    reorderListByPurchased
  }
  def addItem(shoppingItem:ShoppingItem) {
    // val itemFind = list.find{ item => item.name == shoppingItem.name }
    val itemFind = ShoppingList.findItem(shoppingItem.name)
    itemFind match {
      case None =>  ShoppingItem.create(shoppingItem)
      case Some(item) => {
        Logger.warn("Unique name required")
        //val existingItem = removeItem(shoppingItem.name)
        item.markAsNotPurchased
        ShoppingItem.update(item.name,item)
      }
    }
    list = ShoppingList.findItems()
  }
  def removeItem(name:String):ShoppingItem = {
    val itemFound = ShoppingList.findItem(name)
    itemFound match {
      case None =>  sys.error("Item not on list")
      case Some(item) => {
        ShoppingItem.delete(name)
        list = ShoppingList.findItems()
        item
      }
    }
  }
  def updateItem(name:String, shoppingItem:ShoppingItem) {
    // list = list.map { case i => if (i.name == shoppingItem.name) shoppingItem else i }
    ShoppingItem.update(name,shoppingItem)
    reorderListByPurchased
  }
  def purchaseItem(name: String){
    val itemFound = ShoppingList.findItem(name)
    itemFound match {
      case None =>  sys.error("Item not on list")
      case Some(item) => {
        ShoppingItem.storeAsPurchased(name)
      }
    }
    reorderListByPurchased
  }
  def reorderListByPurchased {
    // list.filter { item => !item.isPurchased } ++ list.filter { item => item.isPurchased }
    list = ShoppingList.findItems()
  }
}

object ShoppingList {
  def findItem(name: String): Option[ShoppingItem] = {
    // val itemFind = list.find{ item => item.name == name }
    val itemsFound = DB.withConnection { implicit connection =>
      SQL("select * from ShoppingItem where name = {name}").on(
        'name -> name
      ).as(ShoppingItem.simple *)
    }
    if( itemsFound.isEmpty )  {
      Logger.info("No item found")
      None
    } else
      Some(itemsFound.head)
  }
  def findItems(): Seq[ShoppingItem] = {
    DB.withConnection { implicit connection =>
      SQL("select * from ShoppingItem order by isPurchased,name").as(ShoppingItem.simple *)
    }
  }
}