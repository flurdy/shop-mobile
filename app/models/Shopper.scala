package models

import play.api.Play.current
import play.Logger
import play.api.db._
import anorm._
import anorm.SqlParser._
import scala.Some._


case class Shopper(username: String, password: String)  {
  def findList ={
    ShoppingList.findListByUsername(this.username)
  }
  def findItems ={
    ShoppingList.findItemsByUsername(this.username)
  }
}

object Shopper {

  val simple = {
    get[String]("shopper.username") ~
      get[String]("shopper.password") map {
      case username~password => Shopper(username, password)
    }
  }
  val usernameCheck = """^[^ ][azAZ09_-]+[^ ]$""".r

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
    assert (shopper.username.trim == shopper.username)
    assert (shopper.username.length > 1)
    assert ( usernameCheck.pattern.matcher(shopper.username).matches )
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
      ShoppingList.createList(shopper.username)
      shopper
    }
  }


}
