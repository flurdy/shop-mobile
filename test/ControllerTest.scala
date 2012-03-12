import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._

import models._

class ShoppingControllerSpec extends Specification {

  "The login page" should {
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
