name := "shopgrid"

version := "3.0-SNAPSHOT"

libraryDependencies ++= Seq(
//  "postgresql" % "postgresql" % "9.1-901-1.jdbc4",
//  "com.typesafe" %% "play-plugins-mailer" % "2.1.0",
  "org.webjars" %% "webjars-play" % "2.2.1",
  "org.webjars" % "jquery" % "1.9.1",
  "org.webjars" % "bootstrap" % "3.2.0"
//  jdbc,
//  anorm,
//  cache
)

play.Project.playScalaSettings

