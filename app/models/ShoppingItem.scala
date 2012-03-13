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
          listId:Pk[Long] ){
  def this(name:String, description:String,isPurchased:Boolean,listId:Pk[Long]){
    this(NotAssigned,name.trim,description,isPurchased,listId)
  }
  def this(id:Pk[Long], newItem:ShoppingItem,listId:Pk[Long]){
    this(id,newItem.name.trim,newItem.description,newItem.isPurchased,listId)
  }
  def this(newItem:ShoppingItem){
    this(newItem.id,newItem.name.trim,newItem.description,newItem.isPurchased,newItem.listId)
  }
  def this(name:String, description:String=""){
    this(NotAssigned,name.trim,description,false,NotAssigned)
  }
  def markAsPurchased {
    isPurchased = true
  }
  def markAsNotPurchased {
    isPurchased = false
  }
  def storeAsPurchased {
    DB.withConnection { implicit connection =>
      SQL("update shoppingitem " +
        "set ispurchased=true" +
        " where id = {id}").on(
        'id -> id
      ).executeUpdate()
    }
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
  val itemNameCheck = """^[a-zA-Z0-9_\-][a-zA-Z0-9_\-\ ]*[a-zA-Z0-9_\-]$""".r
  
  def create(item: ShoppingItem):ShoppingItem = {

    assert( item.name.trim == item.name )
    assert( item.name.length > 1 )
    assert ( itemNameCheck.pattern.matcher(item.name).matches, "Illegal charachters:["+item.name+"]" )

    Logger.info("Creating new shopping item:"+item.name)
    ShoppingList.findItemByNameAndListId(item.listId,item.name) match {
      case Some(item) => throw new IllegalStateException("Item already exists")
      case None => {
        DB.withConnection { implicit connection =>
          SQL("insert into shoppingitem(itemname,description,ispurchased,listid)" +
            " values ({name},{description},{ispurchased},{listid})").on(
            'name -> item.name,
            'description -> item.description,
            'ispurchased -> item.isPurchased,
            'listid -> item.listId
          ).executeInsert()
          SQL("select * from shoppingitem " +
            "where itemname = {name}" +
            " and listid = {listid}").on(
            'name -> item.name,
            'listid -> item.listId
          ).as(ShoppingItem.simple.single)
        }
      }
    }
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
//  def storeAsPurchased(username:String, formerName: String): Unit = {
//    DB.withConnection { implicit connection =>
//      SQL("update shoppingitem " +
//        "set ispurchased=true" +
//        " where itemname = {formerName}").on(
//        'formerName -> formerName
//      ).executeUpdate()
//    }
//  }
  def delete(id:Pk[Long]) {
    DB.withConnection { implicit connection =>
      SQL("delete from shoppingitem " +
        " where id = {id}").on(
        'id -> id
      ).execute()
    }
  }
}

