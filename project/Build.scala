import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

    val appName         = "shopgrid"
    val appVersion      = "2.0-SNAPSHOT"

    val appDependencies = Seq(
      // Add your project dependencies here,
      "postgresql" % "postgresql" % "9.1-901-1.jdbc4",
      "com.typesafe" %% "play-plugins-mailer" % "2.0.4",
      jdbc,
      anorm
    )


    val main = play.Project(appName, appVersion, appDependencies).settings(
      // Add your own project settings here
    )

}
