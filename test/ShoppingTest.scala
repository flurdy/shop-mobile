import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._
import play.Logger

import models._

class ShopperSpec extends Specification {

  "A Shopper" should {
    "be able to register" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        Shopper.create(new Shopper("thirduser")) must beAnInstanceOf[Shopper]
      }
    }
    "must have a unique username" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        Shopper.create(new Shopper("thirduser")) must beAnInstanceOf[Shopper]
        Shopper.create(new Shopper("thirduser")) must throwAn[IllegalStateException]
      }
    }
    "when registering will have an empty list" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        Shopper.findByUsername("thirduser") must beNone
        ShoppingList.findListByUsername("thirduser") must beNone
        Shopper.create(new Shopper("thirduser")) must beAnInstanceOf[Shopper]
        Shopper.findByUsername("thirduser").get must beAnInstanceOf[Shopper]
        ShoppingList.findItemsByUsername("thirduser") must be empty
      }
    }
    "not have a blank username" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        Shopper.create(new Shopper(""))  must throwAn[AssertionError]
      }
    }
    "username must not contain funny chars" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val shoppingList = ShoppingList.findListByUsername("testuser").get
        Shopper.create(new Shopper("sdsda&521%¤6"))   must throwAn[AssertionError]
      }
    }
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
    "throw an error for unknownuser" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        Shopper.findByUsername("unknownuser").get.findItems must throwAn[Exception]
      }
    }
    "bananas are on testusers list" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        ShoppingList.findItemByName("testuser","Bananas").get.name must beEqualTo("Bananas")
      }
    }
    "Apples are not on testusers list" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        ShoppingList.findItemByName("testuser","Apples") must beNone
      }
    }
    "be able to remove an item" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val shoppingList = ShoppingList.findListByUsername("testuser").get
        val item = shoppingList.addItem(new ShoppingItem("Burgers"))
        val persistedItem = shoppingList.findItemByName("Burgers")
        persistedItem must beSome
        shoppingList.removeItem(persistedItem.get.id.get)
        shoppingList.findItemByName("Burgers") must beNone
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
        val testitem = testusersList.addItem(new ShoppingItem("Burgers"))
        testitem must beAnInstanceOf[ShoppingItem]

        val otherusersList = ShoppingList.findListByUsername("otheruser").get
        otherusersList.id.get must beGreaterThan(1L)
        val otheritem = otherusersList.addItem(new ShoppingItem("Burgers"))
        otheritem must beAnInstanceOf[ShoppingItem]
        otheritem.id must not be equalTo(testitem.id)
      }
    }
    "mark as purchased" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val testusersList = ShoppingList.findListByUsername("testuser").get
        val apples = testusersList.addItem(new ShoppingItem("Apples"))
        testusersList.findItemByName("Apples").get.isPurchased must beFalse
        apples.storeAsPurchased
        testusersList.findItemByName("Apples").get.isPurchased must beTrue
      }
    }
    "if added by the same name, will mark as not purchased if purchased" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val testusersList = ShoppingList.findListByUsername("testuser").get
        val apples = testusersList.addItem(new ShoppingItem("Apples"))
        apples.id.get must beGreaterThan(4L)
        testusersList.findItemByName("Apples").get.isPurchased must beFalse
        apples.storeAsPurchased
        testusersList.findItemByName("Apples").get.isPurchased must beTrue
        val apples2 = testusersList.addItem(new ShoppingItem("Apples"))
        testusersList.findItemByName("Apples").get.isPurchased must beFalse
      }
    }
    "if added by the same name, will still be not purchased if not purchased" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val testusersList = ShoppingList.findListByUsername("testuser").get
        val apples = testusersList.addItem(new ShoppingItem("Apples"))
        apples.id.get must beGreaterThan(4L)
        testusersList.findItemByName("Apples").get.isPurchased must beFalse
        val apples2 = testusersList.addItem(new ShoppingItem("Apples"))
        testusersList.findItemByName("Apples").get.isPurchased must beFalse
      }
    }
    "be able update name" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val shoppingList = ShoppingList.findListByUsername("testuser").get
        val item = shoppingList.addItem(new ShoppingItem("Burgers"))
        shoppingList.findItemByName("Burgers") must beSome
        val burgers = shoppingList.findItemByName("Burgers").get
        ShoppingItem.update(new ShoppingItem(burgers.id,"Hamburgers",burgers.description,burgers.isPurchased,burgers.listId))
        shoppingList.findItemByName("Burgers") must beNone
        shoppingList.findItemByName("Hamburgers") must beSome
      }
    }
    "if adding similar named item then description is ignored" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val shoppingList = ShoppingList.findListByUsername("testuser").get
        shoppingList.addItem(new ShoppingItem("Burgers","BigMac"))
        shoppingList.findItemByName("Burgers").get.description must beEqualTo("BigMac")
        shoppingList.addItem(new ShoppingItem("Burgers","Whopper"))
        shoppingList.findItemByName("Burgers").get.description mustNotEqual("Whopper")
        shoppingList.findItemByName("Burgers").get.description must beEqualTo("BigMac")
      }
    }
    "if removed a similar named item can be added" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val shoppingList = ShoppingList.findListByUsername("testuser").get
        shoppingList.addItem(new ShoppingItem("Burgers","BigMac"))
        val burger = shoppingList.findItemByName("Burgers").get
        burger.description must beEqualTo("BigMac")
        shoppingList.removeItem(burger.id.get)
        shoppingList.addItem(new ShoppingItem("Burgers","Whopper"))
        shoppingList.findItemByName("Burgers").get.description must beEqualTo("Whopper")
      }
    }
    "name must not contain funny chars" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val shoppingList = ShoppingList.findListByUsername("testuser").get
        shoppingList.addItem(new ShoppingItem("Burgers/&12¨")) must throwAn[AssertionError]
      }
    }
  }
  "name can be several words" in {
    running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
      val shoppingList = ShoppingList.findListByUsername("testuser").get
      shoppingList.addItem(new ShoppingItem("Burgers and chips",""))
      shoppingList.findItemByName("Burgers and chips").get must beAnInstanceOf[ShoppingItem]
    }
  }
} 