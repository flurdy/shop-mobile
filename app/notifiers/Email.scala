package notifiers

import play.Logger
import play.api.{Mode, Play}
import play.api.Play.current
import com.typesafe.plugin._
import models.{ShoppingItem, ShoppingList}



trait EmailService {

  private def noSmtpHostDefinedException = throw new NullPointerException("No SMTP host defined")

  def dispatcher:EmailDispatcher = {
    if (Play.mode == Mode.Prod) {
      Play.configuration.getString("smtp.host") match {
        case None => noSmtpHostDefinedException
        case Some("nohost") => MockEmailDispatcher
        case _ => SmtpEmailDispatcher
      }
    } else {
      MockEmailDispatcher
    }
  }

}


trait EmailDispatcher {

  def sendEmail(from:String, recipient:String, subject:String, body:String)

}

object MockEmailDispatcher extends EmailDispatcher {

  override def sendEmail(from:String, recipient:String, subject:String, body:String) {
    Logger.info("Email sent (mock): [%s] to [%s]" .format(subject,recipient))
    Logger.info("%s" .format(body))
  }

}


object SmtpEmailDispatcher extends EmailDispatcher  {

  def sendEmail(from:String, recipient:String, subject:String, body:String) {
    val mail = use[MailerPlugin].email
    mail.setSubject(subject)
    mail.addFrom(from)
    mail.addRecipient(recipient)
    mail.send(body)
    Logger.info("Email sent: [%s] to [%s]" .format(subject,recipient))
  }

}


object EmailNotifier extends EmailService{

  def shareByEmail(shoppingList:ShoppingList) = {
    val from = Play.configuration.getString("mail.from").getOrElse("nobody@example.com")
    val recipient = Play.configuration.getString("mail.to").getOrElse("nobody@example.com")
    val subject = "Shop: shopping list shared"
    val body = generateBodyOrNot(shoppingList.findItems)
    dispatcher.sendEmail(from,recipient,subject,body)
  }

  def generateBodyOrNot(items:Seq[ShoppingItem]) = {
    if(items.isEmpty){
      """
        No items on the shopping list at the moment
      """.stripMargin
    } else {
      generateBody(items)
    }
  }

  def generateBody(items:Seq[ShoppingItem]) : String = {
    val header =
      """
         Your shopping list is:

      """.stripMargin
    val listBody = generateItemsText(items)
    header ++ listBody
  }

  def generateItemsText(items:Seq[ShoppingItem]) : String = {
    if(!items.isEmpty) {
      if(items.head.isPurchased){
        generateItemsText(items.tail)
      } else {
        itemText(items.head) ++ generateItemsText(items.tail)
      }
    } else {
      ""
    }
  }

  def itemText(item:ShoppingItem) : String = {
    """
       ** %s : %s
    """.stripMargin.format(item.name,item.description)
  }

}




