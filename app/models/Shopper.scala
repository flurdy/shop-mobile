package models

import play.api.Logger



case class Shopper(id: Option[Long], username: String)

object Shoppers {
	
	def findShopper(username: String): Option[Shopper] = None

}
