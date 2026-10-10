package io.github.soutsu.jobcalendar

import android.content.Context
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DeviceParametersBuilders.DeviceParameters
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.DimensionBuilders.sp
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.LayoutElementBuilders.Box
import androidx.wear.protolayout.LayoutElementBuilders.Column
import androidx.wear.protolayout.LayoutElementBuilders.FontStyle
import androidx.wear.protolayout.LayoutElementBuilders.LayoutElement
import androidx.wear.protolayout.LayoutElementBuilders.Row
import androidx.wear.protolayout.LayoutElementBuilders.Spacer
import androidx.wear.protolayout.LayoutElementBuilders.Text
import androidx.wear.protolayout.ModifiersBuilders.Background
import androidx.wear.protolayout.ModifiersBuilders.Border
import androidx.wear.protolayout.ModifiersBuilders.Clickable
import androidx.wear.protolayout.ModifiersBuilders.Corner
import androidx.wear.protolayout.ModifiersBuilders.Modifiers
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import java.time.LocalDate
import java.time.YearMonth
import java.time.ZoneId

/** 月のマス目を表示するタイル。‹ › で前月・翌月、月名のタップで今月に戻る */
class CalendarTileService : TileService() {

    override fun onTileRequest(requestParams: RequestBuilders.TileRequest): ListenableFuture<TileBuilders.Tile> {
        val today = LocalDate.now()
        val data = CalendarData.load(this)
        val clickedId = requestParams.currentState?.lastClickableId.orEmpty()
        val month = TileMonthState.resolve(this, clickedId, data, today)

        val layout = TileLayout(requestParams.deviceConfiguration, data, month, today).build()

        // 日付が変わったら今日の丸枠を更新する。別の月を見ているときは、しばらくしたら今月に戻す
        val now = System.currentTimeMillis()
        val untilMidnight = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli() - now + 1_000
        val freshness = if (month == YearMonth.from(today)) {
            untilMidnight
        } else {
            minOf(untilMidnight, TileMonthState.RESET_AFTER_MS + 1_000)
        }

        val tile = TileBuilders.Tile.Builder()
            .setResourcesVersion(RESOURCES_VERSION)
            .setFreshnessIntervalMillis(freshness)
            .setTileTimeline(TimelineBuilders.Timeline.fromLayoutElement(layout))
            .build()
        return Futures.immediateFuture(tile)
    }

    override fun onTileResourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest,
    ): ListenableFuture<ResourceBuilders.Resources> =
        Futures.immediateFuture(ResourceBuilders.Resources.Builder().setVersion(RESOURCES_VERSION).build())

    companion object {
        private const val RESOURCES_VERSION = "1"
        const val ID_PREV = "prev"
        const val ID_NEXT = "next"
        const val ID_TODAY = "today"
    }
}

/** タイルで表示中の月（タイルの状態）。ボタンのタップでだけ動かす */
object TileMonthState {
    /** 最後の操作からこの時間が過ぎたら今月の表示に戻す */
    const val RESET_AFTER_MS = 10 * 60 * 1000L

    private const val PREFS = "tile_state"
    private const val KEY_MONTH = "month"
    private const val KEY_AT = "at"

    fun resolve(context: Context, clickedId: String, data: CalendarData?, today: LocalDate): YearMonth {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val current = YearMonth.from(today)
        val now = System.currentTimeMillis()

        val stored = prefs.getString(KEY_MONTH, null)?.let { runCatching { YearMonth.parse(it) }.getOrNull() }
        val storedAt = prefs.getLong(KEY_AT, 0L)
        var month = if (stored != null && now - storedAt in 0 until RESET_AFTER_MS) stored else current
        if (!canShowMonth(data, month, today)) month = current

        val target = when (clickedId) {
            CalendarTileService.ID_PREV -> month.minusMonths(1)
            CalendarTileService.ID_NEXT -> month.plusMonths(1)
            CalendarTileService.ID_TODAY -> current
            else -> return month
        }
        if (canShowMonth(data, target, today)) month = target
        prefs.edit().putString(KEY_MONTH, month.toString()).putLong(KEY_AT, now).apply()
        return month
    }
}

/** 丸い画面に収まるよう、画面の大きさからマスの大きさを決めて組み立てる */
private class TileLayout(
    device: DeviceParameters,
    private val data: CalendarData?,
    private val month: YearMonth,
    private val today: LocalDate,
) {
    private val screen = minOf(device.screenWidthDp, device.screenHeightDp).toFloat().takeIf { it > 0 } ?: 192f
    private val cell = screen * 0.098f
    private val rowHeight = cell * 0.9f
    private val sideWidth = cell * 0.95f

    fun build(): LayoutElement {
        val body = Column.Builder()
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .addContent(titleRow())

        if (data != null && data.hasMonth(month)) {
            body.addContent(spacer(cell * 0.12f))
            body.addContent(weekdayRow())
            monthWeeks(month).forEach { body.addContent(weekRow(it)) }
        } else {
            body.addContent(spacer(cell * 1.2f))
            body.addContent(text("データがありません", cell * 0.62f, COLOR_SUBTLE))
            body.addContent(spacer(cell * 1.2f))
        }

        val row = Row.Builder()
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .addContent(sideButton("‹", CalendarTileService.ID_PREV, month.minusMonths(1)))
            .addContent(body.build())
            .addContent(sideButton("›", CalendarTileService.ID_NEXT, month.plusMonths(1)))
            .build()

        return Box.Builder()
            .setWidth(expand())
            .setHeight(expand())
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .setModifiers(Modifiers.Builder().setBackground(Background.Builder().setColor(argb(0xFF000000.toInt())).build()).build())
            .addContent(row)
            .build()
    }

    private fun titleRow(): LayoutElement =
        Box.Builder()
            .setWidth(dp(cell * 7))
            .setHeight(dp(cell * 1.15f))
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .setModifiers(Modifiers.Builder().setClickable(loadClickable(CalendarTileService.ID_TODAY)).build())
            .addContent(text(monthLabel(month), cell * 0.66f, COLOR_WORK, bold = true))
            .build()

    private fun weekdayRow(): LayoutElement {
        val row = Row.Builder()
        WEEKDAY_LABELS.forEachIndexed { i, label ->
            row.addContent(cellBox(rowHeight * 0.85f, text(label, cell * 0.44f, if (isWeekendColumn(i)) COLOR_OFF else COLOR_WEEKDAY)))
        }
        return row.build()
    }

    private fun weekRow(days: List<LocalDate?>): LayoutElement {
        val row = Row.Builder()
        days.forEach { date ->
            if (date == null) {
                row.addContent(spacerBox())
                return@forEach
            }
            val color = if (data!!.isOff(date)) COLOR_OFF else COLOR_WORK
            val label = text(date.dayOfMonth.toString(), cell * 0.56f, color, bold = date == today)
            val content = if (date == today) todayRing(label, color) else label
            row.addContent(cellBox(rowHeight, content))
        }
        return row.build()
    }

    private fun todayRing(label: LayoutElement, color: Int): LayoutElement {
        val size = minOf(cell, rowHeight) * 0.98f
        return Box.Builder()
            .setWidth(dp(size))
            .setHeight(dp(size))
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .setModifiers(
                Modifiers.Builder()
                    .setBackground(
                        Background.Builder()
                            .setColor(argb(0x00000000))
                            .setCorner(Corner.Builder().setRadius(dp(size / 2)).build())
                            .build(),
                    )
                    .setBorder(Border.Builder().setWidth(dp(1.5f)).setColor(argb(color)).build())
                    .build(),
            )
            .addContent(label)
            .build()
    }

    private fun sideButton(label: String, id: String, target: YearMonth): LayoutElement {
        val enabled = canShowMonth(data, target, today)
        val box = Box.Builder()
            .setWidth(dp(sideWidth))
            .setHeight(dp(cell * 3))
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .addContent(text(label, cell * 0.9f, if (enabled) COLOR_WEEKDAY else COLOR_DISABLED, bold = true))
        if (enabled) box.setModifiers(Modifiers.Builder().setClickable(loadClickable(id)).build())
        return box.build()
    }

    private fun loadClickable(id: String): Clickable =
        Clickable.Builder()
            .setId(id)
            .setOnClick(ActionBuilders.LoadAction.Builder().build())
            .build()

    private fun cellBox(height: Float, content: LayoutElement): LayoutElement =
        Box.Builder()
            .setWidth(dp(cell))
            .setHeight(dp(height))
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .addContent(content)
            .build()

    private fun spacerBox(): LayoutElement =
        Spacer.Builder().setWidth(dp(cell)).setHeight(dp(rowHeight)).build()

    private fun spacer(height: Float): LayoutElement =
        Spacer.Builder().setHeight(dp(height)).build()

    private fun text(value: String, sizeSp: Float, color: Int, bold: Boolean = false): LayoutElement {
        val style = FontStyle.Builder()
            .setSize(sp(sizeSp))
            .setColor(argb(color))
        if (bold) style.setWeight(LayoutElementBuilders.FONT_WEIGHT_BOLD)
        return Text.Builder()
            .setText(value)
            .setMaxLines(1)
            .setFontStyle(style.build())
            .build()
    }
}
