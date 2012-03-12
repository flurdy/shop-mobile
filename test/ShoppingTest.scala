import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._

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
        Shopper.findByUsername("unknownuser").findItems must throwAn[Exception]
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