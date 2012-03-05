import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._

import models._

class ShoppingModelsSpec extends Specification {


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
        ShoppingList.findItemsByUsername("unknownuser") must beNull
      }
    }
    "banana is on testusers list" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        ShoppingList.findItem("testuser","banana") must beNone
      }
    }
  }


}

class ShoppingControllerSpec extends Specification {

  "The login page" should  {
    "be default page" in {
      val result = controllers.Application.showLogin()(FakeRequest())
      status(result) must equalTo(OK)
      contentType(result) must beSome("text/html")
      charset(result) must beSome("utf-8")
      contentAsString(result) must contain("Log in")
    }
//    "be shown when not logged in" in {
//      val result = controllers.ShoppingListController.index()(FakeRequest())
//      status(result) must equalTo(SEE_OTHER)
//      contentAsString(result) must contain("Log in")
//    redirectLocation(result) must beSome.which(_ == "/computers")
//    }
  }

}