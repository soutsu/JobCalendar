plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "io.github.soutsu.jobcalendar"
    compileSdk = 35

    defaultConfig {
        applicationId = "io.github.soutsu.jobcalendar"
        minSdk = 30
        targetSdk = 34 // Wear OS 5
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }

    // カレンダーのデータは wear/calendar.json（なければ app/src/main/assets/calendar.json）を
    // 生成フォルダへコピーして取り込む（両方にあっても二重登録にならないよう取り込み口を1つにする）
    sourceSets["main"].assets.setSrcDirs(listOf(layout.buildDirectory.dir("generated/calendarAssets")))
}

val copyCalendarJson by tasks.registering(Copy::class) {
    val candidates = listOf(
        rootProject.file("calendar.json"),
        file("src/main/assets/calendar.json"),
    )
    from(provider {
        candidates.firstOrNull { it.exists() }
            ?: throw GradleException("calendar.json がありません。wear/calendar.json に置いてください。")
    })
    into(layout.buildDirectory.dir("generated/calendarAssets"))
}

tasks.named("preBuild") { dependsOn(copyCalendarJson) }

dependencies {
    implementation("androidx.wear.tiles:tiles:1.6.2")
    implementation("androidx.wear.protolayout:protolayout:1.4.2")
    implementation("com.google.guava:guava:33.3.1-android")
}
