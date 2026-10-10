package io.github.soutsu.jobcalendar

import android.content.Context
import android.util.Log
import org.json.JSONObject
import java.time.LocalDate
import java.time.YearMonth

/**
 * 作成ページの「ファイルに書き出し」で作った calendar.json の中身。
 * ウォッチ側では祝日計算はせず、offDays に含まれる日を休日、それ以外を出勤日として扱う。
 */
class CalendarData(
    val startYear: Int,
    val title: String,
    val subtitle: String,
    val rangeStart: LocalDate,
    val rangeEnd: LocalDate,
    private val offDays: Set<LocalDate>,
    val holidays: Map<LocalDate, String>,
) {
    val firstMonth: YearMonth = YearMonth.from(rangeStart)
    val lastMonth: YearMonth = YearMonth.from(rangeEnd)

    val displayTitle: String
        get() = title.ifBlank { "$startYear - ${startYear + 1}" }

    fun hasMonth(month: YearMonth): Boolean = month in firstMonth..lastMonth

    fun isOff(date: LocalDate): Boolean = date in offDays

    companion object {
        private const val TAG = "CalendarData"
        private const val ASSET_NAME = "calendar.json"

        @Volatile
        private var cached: CalendarData? = null

        /** 読み込めなかったときは null（「データがありません」の表示になる） */
        fun load(context: Context): CalendarData? {
            cached?.let { return it }
            return try {
                val text = context.assets.open(ASSET_NAME).bufferedReader(Charsets.UTF_8).use { it.readText() }
                parse(JSONObject(text)).also { cached = it }
            } catch (e: Exception) {
                Log.w(TAG, "calendar.json を読み込めませんでした", e)
                null
            }
        }

        private fun parse(json: JSONObject): CalendarData {
            val startYear = json.getInt("startYear")
            val offArray = json.optJSONArray("offDays")
            val offDays = buildSet {
                if (offArray != null) {
                    for (i in 0 until offArray.length()) add(LocalDate.parse(offArray.getString(i)))
                }
            }
            val holidaysJson = json.optJSONObject("holidays")
            val holidays = buildMap {
                holidaysJson?.keys()?.forEach { key -> put(LocalDate.parse(key), holidaysJson.getString(key)) }
            }
            return CalendarData(
                startYear = startYear,
                title = json.optString("title", ""),
                subtitle = json.optString("subtitle", ""),
                rangeStart = json.optString("rangeStart").takeIf { it.isNotEmpty() }?.let(LocalDate::parse)
                    ?: LocalDate.of(startYear, 4, 1),
                rangeEnd = json.optString("rangeEnd").takeIf { it.isNotEmpty() }?.let(LocalDate::parse)
                    ?: LocalDate.of(startYear + 1, 3, 31),
                offDays = offDays,
                holidays = holidays,
            )
        }
    }
}

/** 日曜始まりの週ごとのマス目。月の外のマスは null */
fun monthWeeks(month: YearMonth): List<List<LocalDate?>> {
    val first = month.atDay(1)
    val lead = first.dayOfWeek.value % 7 // 日曜=0
    val cells = ArrayList<LocalDate?>()
    repeat(lead) { cells.add(null) }
    for (d in 1..month.lengthOfMonth()) cells.add(month.atDay(d))
    while (cells.size % 7 != 0) cells.add(null)
    return cells.chunked(7)
}

/** その月へ移動できるか（データ期間内、または今月） */
fun canShowMonth(data: CalendarData?, month: YearMonth, today: LocalDate): Boolean =
    month == YearMonth.from(today) || (data != null && data.hasMonth(month))

fun monthLabel(month: YearMonth): String = "${month.year}年${month.monthValue}月"

val WEEKDAY_LABELS = listOf("日", "月", "火", "水", "木", "金", "土")

fun isWeekendColumn(column: Int): Boolean = column == 0 || column == 6

const val COLOR_OFF = 0xFFFF6B6B.toInt()
const val COLOR_WORK = 0xFFFFFFFF.toInt()
const val COLOR_WEEKDAY = 0xFFBBBBBB.toInt()
const val COLOR_DISABLED = 0xFF444444.toInt()
const val COLOR_SUBTLE = 0xFF999999.toInt()
