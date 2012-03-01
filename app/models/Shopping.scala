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
    get [Boolean]("ispurchased") map {
    // get [Pk[Long]]("listId")
      case name~description~ispurchased => ShoppingItem(name,description,ispurchased)
    }
  }
  def create(item: ShoppingItem): Unit = {
    DB.withConnection { implicit connection =>
      SQL("insert into shoppingItem(name,description,ispurchased)" +
        " values ({name},{description},{ispurchased})").on(
        'name -> item.name,
        'description -> item.description,
        'ispurchased -> item.isPurchased
      ).executeInsert()
//      // 'listId -> item.listId
    }
  }
  def update(formerName: String,item: ShoppingItem): Unit = {
    DB.withConnection { implicit connection =>
      SQL("update shoppingitem " +
        "set name={name}," +
        "description={description}," +
        "ispurchased={ispurchased}" +
        " where name = {formerName}").on(
        'name -> item.name,
        'description -> item.description,
        'ispurchased -> item.isPurchased,
        'formerName -> formerName
      ).executeUpdate()
    }
  }
  def storeAsPurchased(formerName: String): Unit = {
    DB.withConnection { implicit connection =>
      SQL("update shoppingitem " +
        "set ispurchased=true" +
        " where name = {formerName}").on(
        'formerName -> formerName
      ).executeUpdate()
    }
  }
  def delete(name: String): Unit = {
    DB.withConnection { implicit connection =>
      SQL("delete from shoppingitem " +
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
      SQL("select * from shoppingitem where name = {name}").on(
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
      SQL("select * from shoppingitem order by ispurchased,name").as(ShoppingItem.simple *)
    }
  }
}



case class Shopper(username: String, password: String)

object Shopper {

  val simple = {
    get[String]("shopper.username") ~
    get[String]("shopper.password") map {
      case username~password => Shopper(username, password)
    }
  }

  def findByUsername(username: String): Option[Shopper] = {
    DB.withConnection { implicit connection =>
      SQL("select * from shopper where username = {username}").on(
        'username -> username
      ).as(Shopper.simple.singleOpt)
    }
  }

  def findAll: Seq[Shopper] = {
    DB.withConnection { implicit connection =>
      SQL("select * from shopper order by username").as(Shopper.simple *)
    }
  }

  def authenticate(username: String, password: String): Option[Shopper] = {
    DB.withConnection { implicit connection =>
      SQL(
        """
         select * from shopper where
         username = {username} and password = {password}
        """
      ).on(
        'username -> username,
        'password -> password
      ).as(Shopper.simple.singleOpt)
    }
  }

  def create(shopper: Shopper): Shopper = {
    DB.withConnection { implicit connection =>
      SQL(
        """
          insert into shopper values (
            {username}, {password}
          )
        """
      ).on(
        'username -> shopper.username,
        'password -> shopper.password
      ).executeUpdate()

      shopper
    }
  }

}
