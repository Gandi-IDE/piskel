/**
 * @require Constants
 * @require Events
 */
(function () {
  var ns = $.namespace('pskl');
  /**
   * Main application controller
   */
  ns.app = {

    init: function () {
      /**
       * When started from APP Engine, appEngineToken_ (Boolean) should be set on window.pskl
       */
      this.isAppEngineVersion = !!pskl.appEngineToken_;

      // This id is used to keep track of sessions in the BackupService.
      this.sessionId = pskl.utils.Uuid.generate();

      this.shortcutService = new pskl.service.keyboard.ShortcutService();
      this.shortcutService.init();

      var size = pskl.UserSettings.get(pskl.UserSettings.DEFAULT_SIZE);
      var fps = Constants.DEFAULT.FPS;
      var descriptor = new pskl.model.piskel.Descriptor('New Piskel', '');
      var piskel = new pskl.model.Piskel(size.width, size.height, fps, descriptor);

      var layer = new pskl.model.Layer('Layer 1');
      var frame = new pskl.model.Frame(size.width, size.height);

      layer.addFrame(frame);
      piskel.addLayer(layer);

      this.corePiskelController = new pskl.controller.piskel.PiskelController(piskel);
      this.corePiskelController.init();

      this.piskelController = new pskl.controller.piskel.PublicPiskelController(this.corePiskelController);
      this.piskelController.init();

      this.paletteImportService = new pskl.service.palette.PaletteImportService();
      this.paletteImportService.init();

      this.paletteService = new pskl.service.palette.PaletteService();
      this.paletteService.addDynamicPalette(new pskl.service.palette.CurrentColorsPalette());

      this.selectedColorsService = new pskl.service.SelectedColorsService();
      this.selectedColorsService.init();

      this.mouseStateService = new pskl.service.MouseStateService();
      this.mouseStateService.init();

      this.paletteController = new pskl.controller.PaletteController();
      this.paletteController.init();

      this.currentColorsService = new pskl.service.CurrentColorsService(this.piskelController);
      this.currentColorsService.init();

      this.palettesListController = new pskl.controller.PalettesListController(this.currentColorsService);
      this.palettesListController.init();

      this.cursorCoordinatesController = new pskl.controller.CursorCoordinatesController(this.piskelController);
      this.cursorCoordinatesController.init();

      this.drawingController = new pskl.controller.DrawingController(
        this.piskelController,
        document.querySelector('#drawing-canvas-container'));
      this.drawingController.init();

      this.previewController = new pskl.controller.preview.PreviewController(
        this.piskelController,
        document.querySelector('#animated-preview-canvas-container'));
      this.previewController.init();

      this.minimapController = new pskl.controller.MinimapController(
        this.piskelController,
        this.previewController,
        this.drawingController,
        document.querySelector('.minimap-container'));
      this.minimapController.init();

      this.framesListController = new pskl.controller.FramesListController(
        this.piskelController,
        document.querySelector('#preview-list-wrapper'));
      this.framesListController.init();

      this.layersListController = new pskl.controller.LayersListController(this.piskelController);
      this.layersListController.init();

      this.settingsController = new pskl.controller.settings.SettingsController(this.piskelController);
      this.settingsController.init();

      this.dialogsController = new pskl.controller.dialogs.DialogsController(this.piskelController);
      this.dialogsController.init();

      this.toolController = new pskl.controller.ToolController();
      this.toolController.init();

      this.selectionManager = new pskl.selection.SelectionManager(this.piskelController);
      this.selectionManager.init();

      this.historyService = new pskl.service.HistoryService(this.piskelController);
      this.historyService.init();

      this.notificationController = new pskl.controller.NotificationController();
      this.notificationController.init();

      this.transformationsController = new pskl.controller.TransformationsController();
      this.transformationsController.init();

      this.progressBarController = new pskl.controller.ProgressBarController();
      this.progressBarController.init();

      this.canvasBackgroundController = new pskl.controller.CanvasBackgroundController();
      this.canvasBackgroundController.init();

      this.indexedDbStorageService = new pskl.service.storage.IndexedDbStorageService(this.piskelController);
      this.indexedDbStorageService.init();

      this.localStorageService = new pskl.service.storage.LocalStorageService(this.piskelController);
      this.localStorageService.init();

      this.fileDownloadStorageService = new pskl.service.storage.FileDownloadStorageService(this.piskelController);
      this.fileDownloadStorageService.init();

      this.desktopStorageService = new pskl.service.storage.DesktopStorageService(this.piskelController);
      this.desktopStorageService.init();

      this.galleryStorageService = new pskl.service.storage.GalleryStorageService(this.piskelController);
      this.galleryStorageService.init();

      this.storageService = new pskl.service.storage.StorageService(this.piskelController);
      this.storageService.init();

      this.importService = new pskl.service.ImportService(this.piskelController);
      this.importService.init();

      this.imageUploadService = new pskl.service.ImageUploadService();
      this.imageUploadService.init();

      this.savedStatusService = new pskl.service.SavedStatusService(
        this.piskelController,
        this.historyService);
      this.savedStatusService.init();

      this.backupService = new pskl.service.BackupService(this.piskelController);
      this.backupService.init();

      this.beforeUnloadService = new pskl.service.BeforeUnloadService(this.piskelController);
      this.beforeUnloadService.init();

      this.headerController = new pskl.controller.HeaderController(
        this.piskelController,
        this.savedStatusService);
      this.headerController.init();

      this.penSizeService = new pskl.service.pensize.PenSizeService();
      this.penSizeService.init();

      this.penSizeController = new pskl.controller.PenSizeController();
      this.penSizeController.init();

      this.fileDropperService = new pskl.service.FileDropperService(this.piskelController);
      this.fileDropperService.init();

      this.userWarningController = new pskl.controller.UserWarningController(this.piskelController);
      this.userWarningController.init();

      this.performanceReportService = new pskl.service.performance.PerformanceReportService(
        this.piskelController,
        this.currentColorsService);
      this.performanceReportService.init();

      this.clipboardService = new pskl.service.ClipboardService(this.piskelController);
      this.clipboardService.init();

      this.drawingLoop = new pskl.rendering.DrawingLoop();
      this.drawingLoop.addCallback(this.render, this);
      this.drawingLoop.start();

      this.initTooltips_();

      // eslint-disable-next-line max-len
      var piskelData = this.getPiskelInitData_();
      if (piskelData && piskelData.piskel) {
        this.loadPiskel_(piskelData);
      }

      if (pskl.devtools) {
        pskl.devtools.init();
      }

      if (pskl.utils.Environment.detectNodeWebkit() && pskl.utils.UserAgent.isMac) {
        var gui = require('nw.gui');
        var mb = new gui.Menu({ type: 'menubar' });
        mb.createMacBuiltin('Piskel');
        gui.Window.get().menu = mb;
      }

      if (!pskl.utils.Environment.isIntegrationTest() && pskl.utils.UserAgent.isUnsupported()) {
        $.publish(Events.DIALOG_SHOW, {
          dialogId: 'unsupported-browser'
        });
      }

      if (pskl.utils.Environment.isDebug()) {
        pskl.app.shortcutService.registerShortcut(pskl.service.keyboard.Shortcuts.DEBUG.RELOAD_STYLES,
          window.reloadStyles);
      }

      if (window.opener) {
        this.initGandiBridge();
      }
    },

    loadPiskel_: function (piskelData) {
      var serializedPiskel = piskelData.piskel;
      pskl.utils.serialization.Deserializer.deserialize(serializedPiskel, function (piskel) {
        pskl.app.piskelController.setPiskel(piskel);
        $.publish(Events.PISKEL_SAVED);
        if (piskelData.descriptor) {
          // Backward compatibility for v2 or older
          piskel.setDescriptor(piskelData.descriptor);
        }
      });
    },

    getPiskelInitData_: function () {
      return pskl.appEnginePiskelData_;
    },

    isLoggedIn: function () {
      var piskelData = this.getPiskelInitData_();
      return piskelData && piskelData.isLoggedIn;
    },

    initTooltips_: function () {
      $('body').tooltip({
        selector: '[rel=tooltip]'
      });
    },

    render: function (delta) {
      this.drawingController.render(delta);
      this.previewController.render(delta);
      this.framesListController.render(delta);
    },

    getFirstFrameAsPng: function () {
      var frame = pskl.utils.LayerUtils.mergeFrameAt(this.piskelController.getLayers(), 0);
      var canvas;
      if (frame instanceof pskl.model.frame.RenderedFrame) {
        canvas = pskl.utils.CanvasUtils.createFromImage(frame.getRenderedFrame());
      } else {
        canvas = pskl.utils.FrameUtils.toImage(frame);
      }
      return canvas.toDataURL('image/png');
    },

    getFramesheetAsPng: function () {
      var renderer = new pskl.rendering.PiskelRenderer(this.piskelController);
      var framesheetCanvas = renderer.renderAsCanvas();
      return framesheetCanvas.toDataURL('image/png');
    },

    initGandiBridge: function () {
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.get('tid')) {
        console.error('Missing tid in query params');
        return;
      }

      let descriptor = new pskl.model.piskel.Descriptor(
        'Gandi - ' + urlParams.get('tname'),
        urlParams.get('tid')
      );
      this.piskelController.getPiskel().setDescriptor(descriptor);
      let frame0 = this.piskelController.getLayerAt(0).getFrameAt(0);
      frame0.costume = {
        id: `first-${crypto.randomUUID()}`,
        name: 'costume1',
      };
      $.publish(Events.PISKEL_SAVED);

      window.addEventListener('message', function (event) {
        // console.log('Received message from parent window', event.data);
        if (event.data.name === 'plugin-piskel-data') {
          const costumeData = event.data.data;
          if (costumeData.dataFormat === 'svg') {
            const svgString = new TextDecoder().decode(costumeData.assetData);
            var blob = new Blob([svgString], { type: 'image/svg+xml' });
          } else {
            var blob = new Blob([costumeData.assetData], { type: `image/${costumeData.dataFormat}` });
          }
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = function () {
            var canvas = pskl.utils.CanvasUtils.createCanvas(Constants.DEFAULT.WIDTH, Constants.DEFAULT.HEIGHT);
            var context = canvas.getContext('2d');
            context.save();
            pskl.utils.CanvasUtils.disableImageSmoothing(canvas);
            context.translate(canvas.width / 2, canvas.height / 2);
            context.drawImage(
              img,
              -costumeData.rotationCenter[0] / costumeData.bitmapResolution,
              -costumeData.rotationCenter[1] / costumeData.bitmapResolution,
              img.width / costumeData.bitmapResolution,
              img.height / costumeData.bitmapResolution
            );
            context.restore();

            let piskel = this.piskelController.getPiskel();
            const frame = pskl.utils.FrameUtils.createFromImage(canvas);
            frame.costume = {
              id: costumeData.costumeId,
              name: costumeData.name,
            };
            let frame0 = piskel.getLayerAt(0).getFrameAt(0);
            if (frame0.costume && frame0.costume.id.startsWith('first-')) {
              piskel.getLayerAt(0).frames[0] = frame;
              this.piskelController.setCurrentFrameIndex(0);
            } else {
              let fc = this.piskelController.getFrameCount();
              let layers = piskel.getLayers();

              // 遍历当前的 frame 有没有 costume.id 一样的，有的话替换，没有的话添加
              let layer0 = layers[0];
              let found = false;
              for (let fi = 0; fi < fc; fi++) {
                let f = layer0.getFrameAt(fi);
                if (f.costume && f.costume.id === frame.costume.id) {
                  found = true;
                  layer0.frames[fi] = frame;
                  this.piskelController.setCurrentFrameIndex(fi);
                }
              }

              if (!found) {
                for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
                  if (layerIdx == 0) {
                    layers[layerIdx].addFrameAt(frame, fc);
                  } else {
                    layers[layerIdx].addFrameAt(this.piskelController.createEmptyFrame_(), fc);
                  }
                }
                this.piskelController.setCurrentFrameIndex(fc);
              }
            }
            this.framesListController.updateScrollerOverflows();
            this.framesListController.flagForRedraw_(true);
            $.publish(Events.PISKEL_SAVE_STATE, {
              type: pskl.service.HistoryService.SNAPSHOT
            });
          }.bind(this);
          img.src = url;
        } else if (event.data.name === 'plugin-piskel-sync') {
          const { tempCostumeId, costumeId, name } = event.data.data;
          for (var i = 0; i < this.piskelController.getFrameCount(); i++) {
            let layer0 = this.piskelController.getLayerAt(0);
            let frame = layer0.getFrameAt(i);
            if (tempCostumeId && frame.costume && frame.costume.id === tempCostumeId) {
              frame.costume.id = costumeId;
              frame.costume.name = name;
              this.piskelController.setCurrentFrameIndex(i);
              $.publish(Events.PISKEL_SAVE_STATE, {
                type: pskl.service.HistoryService.SNAPSHOT
              });
              break;
            }
          }
        }
      }.bind(this), false);

      window.opener.postMessage({
        name: 'plugin-piskel-loaded',
        tid: urlParams.get('tid'),
      }, '*');

      window.addEventListener('beforeunload', function () {
        window.opener.postMessage({
          name: 'plugin-piskel-unloaded',
          tid: urlParams.get('tid'),
        }, '*');
      });

      $.subscribe(Events.PISKEL_SAVED, function () {
        for (var i = 0; i < this.piskelController.getFrameCount(); i++) {
          let layer0 = this.piskelController.getLayerAt(0);
          let frame = layer0.getFrameAt(i);
          const bitmapResolution = 2;

          let canvas = pskl.utils.CanvasUtils.createCanvas(
            frame.getWidth() * bitmapResolution,
            frame.getHeight() * bitmapResolution
          );
          let context = canvas.getContext('2d');
          this.piskelController.getLayers().forEach(function (l) {
            let render = pskl.utils.FrameUtils.toImage(l.getFrameAt(i), bitmapResolution, true);
            context.drawImage(render, 0, 0, render.width, render.height, 0, 0, canvas.width, canvas.height);
          });

          // console.log('saving frame', frame);
          if (frame.costume && !frame.costume.id.startsWith('temp-') && !frame.costume.id.startsWith('first-')) {
            let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            let buffer = imageData.data.buffer;
            window.opener.postMessage({
              name: 'plugin-piskel-update',
              data: buffer,
              fileType: 'image/png',
              width: canvas.width,
              height: canvas.height,
              costumeId: frame.costume.id,
            }, '*');
          } else {
            if (!frame.costume) {
              frame.costume = {
                id: `temp-${crypto.randomUUID()}`,
                name: `frame-${i}`,
              };
            } else {
              frame.costume.id = `temp-${crypto.randomUUID()}`;
            }
            canvas.toBlob(function (blob) {
              const reader = new FileReader();
              reader.onload = function () {
                let desc = this.piskelController.getPiskel().getDescriptor();
                let targetId = desc.description;
                window.opener.postMessage({
                  name: 'plugin-piskel-add',
                  data: reader.result,
                  fileType: 'image/png',
                  fileName: frame.costume.name,
                  targetId: targetId,
                  tempCostumeId: frame.costume.id,
                }, '*');
              }.bind(this);
              reader.readAsArrayBuffer(blob);
            }.bind(this), 'image/png');
          }
        }
      }.bind(this));
    },
  };
})();

