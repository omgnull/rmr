
var App = {
    counter: 0,
    $pc: undefined,
    $tpl: undefined,
    $submit: undefined,
    $message: undefined,
    init: function(){
        this.$pc = jQuery("#parameters");
        this.$tpl = jQuery("#parameter-template");
        this.$tpl.remove();
        this.$tpl.removeAttr("id", '');

        this.$submit = jQuery("#send");
        this.$message = jQuery("#message-template");
        this.$message.remove();
        this.$message.removeAttr("id", '');

        jQuery("#example").on('click', function(e){
            e.preventDefault();
            jQuery("#url").val(this.childNodes[1].getAttribute('href'));
        });
        jQuery('#nav a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        })
        jQuery("#add-parameter").on('click', function(e){
            e.preventDefault();
            App.addParameter();
        });
        this.$pc.on('click', '.remove-parameter', function(e){
            e.preventDefault();
            App.removeParameter(this);
        });
        jQuery(document).on('submit', 'form', function(e) {
            App.submit(e);
        });
    },
    addParameter: function() {
        this.counter++;
        var $parameter = this.$tpl.clone();
        this.$pc.append($parameter);
    },
    removeParameter: function(el) {
        jQuery(el).parent().parent().remove();
    },
    submit: function(e) {
        e.preventDefault();
        var scope = this;
        this.$submit.attr('disabled', true);
        jQuery
            .post("/api", jQuery("form").serialize())
            .done(function(data) {
                console.log(data);

                if (data['message']) {
                    var message = scope.$message.clone();
                    message.find('span').html(data['message']);
                    jQuery("#message").append(message);
                    scope.$submit.removeAttr('disabled');
                    return;
                }

                var containers = ['request', ['response']];

                for (var i = 0; i < containers.length; i++) {
                    var container, $container, $body, list;
                    container = containers[i];
                    $container = jQuery("#" + container);
                    $container.html('');

                    $container.append('<h4>Headers</h4>');
                    console.log(data[container]);

                    list = ['<ul>'];
                    for (var it = 0; it < data[container]['headers'].length; it++) {
                        list.push('<li>' + data[container]['headers'][it] + '</li>');
                    }

                    list.push('</ul>');
                    $container.append(list);

                    $container.append('<h4>Body</h4>');
                    $body = jQuery('<pre class="well"></pre>');
                    $body.text(scope.pretty(data[container]['body']));

                    $container.append($body);
                }

                scope.$submit.removeAttr('disabled');
            });
    },
    pretty: function(json) {
        if (!json) {
            return '';
        }

        if (typeof json != 'string') {
            return JSON.stringify(json, undefined, 4);
        } else {
            console.log(json.indexOf(0));
            if (143 === json.indexOf(0)) {
                return this.prettyXml(json);
            }

            return JSON.stringify(JSON.parse(json), undefined, 4);
        }
    },
    prettyXml: function(xml){
        var formatted = '';
        var reg = /(>)(<)(\/*)/g;
        xml = xml.replace(reg, '$1\r\n$2$3');
        var pad = 0;
        jQuery.each(xml.split('\r\n'), function(index, node) {
            var indent = 0;
            if (node.match( /.+<\/\w[^>]*>$/ )) {
                indent = 0;
            } else if (node.match( /^<\/\w/ )) {
                if (pad != 0) {
                    pad -= 1;
                }
            } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
                indent = 1;
            } else {
                indent = 0;
            }

            var padding = '';
            for (var i = 0; i < pad; i++) {
                padding += '  ';
            }

            formatted += padding + node + '\r\n';
            pad += indent;
        });

        return formatted;
    }
};
