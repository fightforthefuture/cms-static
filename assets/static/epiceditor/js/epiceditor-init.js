(function($){

    window.epicInit = function(static_url){
        var $editors = $('.epiceditor');
        $editors.each(function(index, editor){
            var $editor = $(editor),
                existing = $editor.data('editor');
            if($editor.data('editor') === undefined || !existing){
                if($editor.closest('.inline-group').is(':hidden')){
                    return;
                }
                var $sync = $editor.find('textarea').hide(),
                    $entry = $('<div />').prependTo($editor),
                    initialized = new EpicEditor({
                        'container': $entry.get(0),
                        'clientSideStorage': false,
                        'basePath': static_url + 'epiceditor',
                        'file': {
                            'name': 'epiceditor',
                            'defaultContent': $sync.val(),
                            'autoSave': 100
                        },
                        'theme': {
                            'base': '/themes/base/epiceditor.css',
                            'preview': '/themes/preview/github.css',
                            'editor': '/themes/editor/epic-light.css'
                        }
                    }).load();
                $editor.data('editor', initialized);
                initialized.load(function() {
                    $sync.val(initialized.exportFile());
                });
                initialized.on('save', function () {
                    $sync.val(initialized.exportFile());
                });
                epicEditors.push(initialized);
            }
        });
    };

    $('.navi_tab').live('click', function(evt){
        $.each(epicEditors, function(index, editor){
            editor.unload(function(){
                editor.load();
            });
        });
    });

})(django.jQuery);
