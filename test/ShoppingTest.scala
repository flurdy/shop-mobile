import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._
import play.Logger

import models._

class ShopperSpec extends Specification {

  "A Shopper" should {
    "be able to register" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        Shopper.create(new Shopper("thirduser","")) must beAnInstanceOf[Shopper]
      }
    }
    "must have a unique username" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        Shopper.create(new Shopper("thirduser","")) must beAnInstanceOf[Shopper]
        Shopper.create(new Shopper("thirduser",""))  must throwAn[Exception]
      }
    }
//    "must have a username" in {
//      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
//        Shopper.create(new Shopper("",""))  must throwAn[Exception]
//      }
//    }
  }
}

class ShoppingListSpec extends Specification {
  "The Shopping list " should {
    "display 4 items for testuser" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        ShoppingList.findItemsByUsername("testuser") must have size(4)
      }
    }
    "display 0 items for otheruser" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        ShoppingList.findItemsByUsername("otheruser") must be empty
      }
    }
    "throw error for unknownuser" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        Shopper.findByUsername("unknownuser").get.findItems must throwAn[Exception]
      }
    }
    "bananas is on testusers list" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        ShoppingList.findItem("testuser","Bananas") must beSome
      }
    }
    "Apples is not on testusers list" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        ShoppingList.findItem("testuser","Apples") must beNone
      }
    }
  }
}

class ShoppingItemSpec extends Specification {
  "A shopping item" should {
    "be able to have the same name for two different people's list" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {

        val testusersList = ShoppingList.findListByUsername("testuser").get
        testusersList.id.get must beGreaterThan(0L)
        val testitem:ShoppingItem = testusersList.addItem(new ShoppingItem("Burgers"))
        testitem must beAnInstanceOf[ShoppingItem]

        val otherusersList = ShoppingList.findListByUsername("otheruser").get
        otherusersList.id.get must beGreaterThan(1L)
        val otheritem:ShoppingItem = otherusersList.addItem(new ShoppingItem("Burgers"))
        otheritem must beAnInstanceOf[ShoppingItem]
        otheritem.id must beEqualTo(testitem.id)
      }
    }
  }
} 