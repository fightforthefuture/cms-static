(function($){

    $.fn.countdown = function(options){

        var settings = $.extend({
            'to': 140
        }, options);

        return this.each(function() {

            var $wrapper = $('<div />', {
                    'class': 'countdown-wrapper'
                }),
                $input = $(this).wrap($wrapper),
                $counter = $('<span />', {
                    'class': 'countdown-count',
                    'text': !!$input.val().length ? (settings['to'] - $input.val().length) : settings['to']
                }).insertAfter($input);

            $input.bind('keyup change', function(){
                var length = $input.val().length,
                    diff = settings['to'] - length;
                $counter.text(diff);
                if(diff < 0.1 * settings['to']){
                    $counter.addClass('countdown-close');
                }else{
                    $counter.removeClass('countdown-close');
                }
            });

        });

    };

    $(function(){

        $('#id_fs_twitter_text').countdown({
            'to': 140
        });
        $('#id_title').countdown({
            'to': 140
        });

    });

})(django.jQuery);