package models

import play.api.Play.current
import play.Logger
import play.api.db._
import anorm._
import anorm.SqlParser._
import scala.Some._


case class ShoppingItem(
          id:Pk[Long],
          name:String,
          description:String,
          var isPurchased:Boolean,
          listId:Pk[Long]){
  def this(name:String, description:String,isPurchased:Boolean,listId:Pk[Long]){
    this(NotAssigned,name,description,isPurchased,listId)
//    Logger.error("List id is " +  listId)
//    Logger.error("Item id is " + id.getOrElse( throw new IllegalArgumentException("Item ID NULL:"+id) ))
//    Logger.error("Item List id is " + listId.getOrElse( throw new IllegalArgumentException("Item list ID NULL:"+listId) ))
  }
  def this(name:String, description:String){
    this(NotAssigned,name,description,false,NotAssigned)
  }
  def this(name:String){
    this(NotAssigned,name,"",false,NotAssigned)
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
    get [Pk[Long]]("id") ~
      get [String]("itemname") ~
    get [String]("description") ~
    get [Boolean]("ispurchased") ~
    get [Pk[Long]]("listid") map {
      case id~itemname~description~ispurchased~listid => ShoppingItem(id,itemname,description,ispurchased,listid)
    }
  }
  def create(item: ShoppingItem) = {
    // TODO: check if newname is unique
    // TODO: check if newname trimmed is > 1 char
//    Logger.error("List id is " + item.listId.getOrElse( throw new IllegalArgumentException("ID NULL") ))
    DB.withConnection { implicit connection =>
      SQL("insert into shoppingitem(itemname,description,ispurchased,listid)" +
        " values ({name},{description},{ispurchased},{listid})").on(
        'name -> item.name,
        'description -> item.description,
        'ispurchased -> item.isPurchased,
        'listid -> item.listId
      ).executeInsert()
    }
    item
  }
  def update(item: ShoppingItem) = {
    // TODO: check if newname is unique
    // TODO: check if newname trimmed is > 1 char
    DB.withConnection { implicit connection =>
      SQL("update shoppingitem " +
        "set itemname={name}," +
        "description={description}," +
        "ispurchased={ispurchased}" +
        " where id = {id}").on(
        'name -> item.name,
        'description -> item.description,
        'ispurchased -> item.isPurchased,
        'id -> item.id
      ).executeUpdate()
    }
    item
  }
  def storeAsPurchased(username:String, formerName: String): Unit = {
    DB.withConnection { implicit connection =>
      SQL("update shoppingitem " +
        "set ispurchased=true" +
        " where itemname = {formerName}").on(
        'formerName -> formerName
      ).executeUpdate()
    }
  }
  def delete(name: String): Unit = {
    DB.withConnection { implicit connection =>
      SQL("delete from shoppingitem " +
        " where itemname = {name}").on(
        'name -> name
      ).execute()
    }
  }
}

