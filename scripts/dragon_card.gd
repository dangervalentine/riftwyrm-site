extends SceneTree
## The hero's Dragon Card, in three layers, drawn by the game's own widgets so the
## site's card is the card the game prints:
##   card.png    the Dragon Card with its lair empty (no dragon drawn on it)
##   figures.png the card again with its figures (Initiative, Attack, Armor and the
##               two ladders) held back too; the site keeps only what differs, which
##               is the figures, and lays them back over the dragon as printed
##   dragon.png  the dragon alone on a clear ground, lit as the card lights it, uncut,
##               at the size it stands on the card
##   place.json  where the dragon stands on the card and where the card cuts it,
##               as shares of the card's size
## Run from the game's folder, kept on top so each frame is redrawn:
## godot --path ../dragon-hunter --always-on-top -s "$PWD/scripts/dragon_card.gd" -- <out dir> [dragon id]

const T = preload("res://ui/theme/tokens.gd")
const UI = preload("res://ui/theme/theme.gd")
const Settings = preload("res://ui/model/settings.gd")
const ViewState = preload("res://ui/model/view_state.gd")
const DragonCard = preload("res://ui/widgets/dragon_card.gd")
const Creature = preload("res://ui/fx/creature.gd")
const HistoryStore = preload("res://ui/model/history_store.gd")

const WINDOW := Vector2i(1440, 900)
## The card's width on the table, in design units, as tools/card_shots.gd draws it.
const BIG_W := 440.0
const MARGIN := 24.0
## The dragon is drawn this many times its size on the card.
const DRAGON_SCALE := 1.0

var out := "."
var id := "fire"
var ui
var _table: ColorRect
var _stage: Control


func _initialize() -> void:
	HistoryStore.use_empty("user://tool_history/")
	Settings.use_for_tools()
	var args := OS.get_cmdline_user_args()
	if args.size() > 0:
		out = args[0]
	if args.size() > 1:
		id = args[1]
	_run()


func _run() -> void:
	DisplayServer.window_set_size(WINDOW)
	root.size = WINDOW
	for i in 3:
		await process_frame
	ui = load("res://scenes/main.tscn").instantiate()
	root.add_child(ui)
	for i in 3:
		await process_frame
	var layer := CanvasLayer.new()
	layer.layer = 100
	root.add_child(layer)
	_table = ColorRect.new()
	_table.color = T.GROUND
	_table.size = Vector2(WINDOW)
	layer.add_child(_table)
	_stage = Control.new()
	layer.add_child(_stage)
	DirAccess.make_dir_recursive_absolute(out)

	var card := DragonCard.new()
	var m := ViewState.dragon_card_model(ui.db.dragon("dragon_" + id) if ui.db.dragon_ids().has("dragon_" + id) else ui.db.dragon(id))
	var size := DragonCard.card_size(BIG_W)
	_stage.add_child(card)
	card.position = Vector2(MARGIN, MARGIN)
	card.size = size
	card.render(m)
	card.figure_hidden = true
	await create_timer(0.5).timeout
	await _save(Rect2(card.position, size), "card.png", false)
	card.figures_hidden = true
	await create_timer(0.2).timeout
	await _save(Rect2(card.position, size), "figures.png", false)

	# Where the card stands its dragon, and the picture under the band it cuts it to.
	var at := DragonCard.art_rect(size, m.art)
	var top := size.y * DragonCard.LAYOUT.band.end.y
	var place := {
		"card": [size.x, size.y],
		"art": [at.position.x / size.x, at.position.y / size.y, at.size.x / size.x, at.size.y / size.y],
		"cut_top": top / size.y,
		"radius": UI.card_radius(size.x) / size.x,
	}
	var f := FileAccess.open("%s/place.json" % out, FileAccess.WRITE)
	f.store_string(JSON.stringify(place, "  ", true))
	f.close()

	# The dragon alone: set up as the card sets up its own, and not cut.
	card.queue_free()
	var c := Creature.new()
	c.held = true
	_stage.add_child(c)
	c.setup(m.art, Color(T.essence(m.affinity).lightened(0.3), 0.6), m.affinity, false)
	c.silhouette(Color(T.SHADE, 0))
	var big := at.size * DRAGON_SCALE
	c.position = Vector2(MARGIN, MARGIN)
	c.size = big
	_table.visible = false
	ui.visible = false
	await create_timer(0.5).timeout
	await _save(Rect2(c.position, big), "dragon.png", true)
	quit()


func _save(r: Rect2, file: String, clear: bool) -> void:
	root.transparent_bg = clear
	for i in 3:
		await process_frame
	var img: Image = root.get_texture().get_image()
	var k := Vector2(img.get_size()) / root.get_visible_rect().size
	var px := Rect2i(Vector2i((r.position * k).round()), Vector2i((r.size * k).round())).intersection(Rect2i(Vector2i.ZERO, img.get_size()))
	if px.size != Vector2i((r.size * k).round()):
		push_warning("%s is cut by the window (%s of %s)" % [file, px.size, r.size * k])
	var path := "%s/%s" % [out, file]
	img.get_region(px).save_png(path)
	print("saved ", path)
