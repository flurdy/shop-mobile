resolvers ++= Seq(
   DefaultMavenRepository,
   Resolver.url("Play", url("http://download.playframework.org/ivy-releases/"))(Resolver.ivyStylePatterns),
   "Typesafe Repository" at "http://repo.typesafe.com/typesafe/releases/",
	"sbt-idea-repo" at "http://mpeltonen.github.com/maven"
)

addSbtPlugin("com.github.mpeltonen" % "sbt-idea" % "0.11.0")

libraryDependencies += "play" %% "play" % "2.0-beta"
