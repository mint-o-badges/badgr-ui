window.addEventListener('styleguide:onRendered', function () {
	var dialogs = function () {
		dialogs = document.querySelectorAll('dialog');

		var getDialog = function (event) {
			var dialogId = event.target.getAttribute('aria-controls');
			var dialog = document.getElementById(dialogId);
			return dialog;
		};

		var closeDialog = function (event) {
			var dialog = getDialog(event);
			dialog.classList.remove('dialog-is-visible');
			dialog.close();
		};

		var openDialog = function (event) {
			var dialog = getDialog(event);
			var closeTriggers = dialog.querySelectorAll('[aria-controls="' + dialogId + '"]');
			if (closeTriggers) {
				for (var i = 0; i < closeTriggers.legnth; i++) {
					closeTriggers[i].addEventListener('click', closeDialog);
				}
			}
			dialog.showModal();
			dialog.classList.add('dialog-is-visible');
		};

		for (var i = 0; i < dialogs.length; i++) {
			dialogPolyfill.registerDialog(dialogs[i]);
			var dialogId = dialogs[i].id;
			var dialogTrigger = document.querySelector('[aria-controls="' + dialogId + '"]');
			dialogTrigger.addEventListener('click', openDialog);
		}
	};

	dialogs();
});
