var levelBuilder = angular.module('levelBuilder', []);
 
levelBuilder.controller('levelController', function ($scope) {
    document.getElementById("whitesheet").oncontextmenu = function(){return false;}; // Désactivation du click droit
    $scope.mouseCoord = {'x': 0, 'y' : 0};
    $scope.planCoord = {'x': 0, 'y' : 0};
    $scope.origin = {'cx': 0, 'cy': 0, 'r': 5};
    $scope.startMove = {'x': 0, 'y': 0};
    $scope.createType = null;
    $scope.elements = [];
    $scope.textures = [];
    $scope.drawing = false;
    $scope.begin = null;
    $scope.uploadedFile = null;
    $scope.xml = null;
    $scope.offset = {'x': 0, 'y': 0};
    $scope.isSelected = false;
    $scope.showResize = false;
    $scope.showXML = false;
    $scope.gx = 0;
    $scope.gy = -0.9;
    $scope.player_angular_damping = 0.0;
    $scope.player_linear_damping = 0.0;
    $scope.impulse_strength = 50;
    $scope.toggleXML = function() {
        if($scope.showXML) {
            $scope.loadXML();
            $scope.showXML = false;
        } else {
            $scope.generateXML();
            $scope.showXML = true;
        }
    };
    $scope.setCreateType = function(type) {
        $scope.createType = type;
        $scope.drawing = false;
        if (type !== 'resize') {
            $('.selected.texture').attr('class', 'texture');
            $('#svg .selected.poly').attr('class', 'poly');
            $('#svg .selected').attr('class', '');
            $scope.isSelected = false;
            $scope.showResize = false;
        }
    };
    $scope.showProperties = function() {
        $('#modalInfo'+$('.selected').attr('id')).modal();
    };
    $scope.setMouseCoord = function(event) {
        $scope.mouseCoord.x = event.layerX - $scope.offset.x;
        $scope.mouseCoord.y = event.layerY - $scope.offset.y;
        $scope.planCoord.x = -($scope.origin.cx - event.layerX) - $scope.offset.x;
        $scope.planCoord.y = $scope.origin.cy - event.layerY + $scope.offset.y;
    };
    $scope.actionBegin = function() {
        // console.log($scope.elements);
        switch ($scope.createType) {
            case 'select1':
                if (!$scope.drawing) {
                    $scope.startMove.x = $scope.mouseCoord.x;
                    $scope.startMove.y = $scope.mouseCoord.y;
                    $scope.drawing = true;
                }
                break;
            case 'select2':
                $scope.startMove.x = $scope.mouseCoord.x;
                $scope.startMove.y = $scope.mouseCoord.y;
                $scope.drawing = true;
                break;
            case 'origin':
                $scope.origin.cx = $scope.mouseCoord.x;
                $scope.origin.cy = $scope.mouseCoord.y;
                break;
            case 'resize':
                $scope.drawing = true;
                break;
            case 'rect':
                var element = {
                    'id': $scope.elements.length,
                    'type': 'rect',
                    'x': $scope.mouseCoord.x,
                    'y': $scope.mouseCoord.y,
                    'shape': 'box',
                    'name' : '',
                    'angle' : '0',
                    'display' : true,
                    'body_type' : 'static',
                    'body_tag' : '',
                    'body_bullet' : false,
                    'body_angular_damping' : '0.0',
                    'body_linear_damping' : '0.0',
                    'fixture_density' : '0.9',
                    'fixture_restitution' : '0.0'
                };
                $scope.elements.push(element);
                $scope.drawing = true;
                break;
            case 'circle':
                var element = {
                    'id': $scope.elements.length,
                    'type': 'circle',
                    'x': $scope.mouseCoord.x,
                    'y': $scope.mouseCoord.y,
                    'shape': 'circle',
                    'name' : '',
                    'angle' : '0',
                    'display' : true,
                    'body_type' : 'static',
                    'body_tag' : '',
                    'body_bullet' : false,
                    'body_angular_damping' : '0.0',
                    'body_linear_damping' : '0.0',
                    'fixture_density' : '0.9',
                    'fixture_restitution' : '0.0'
                };
                $scope.elements.push(element);
                $scope.drawing = true;
                break;
            case 'path':
                if (!$scope.drawing) { // Début du chemin
                    var element = {
                        'id': $scope.elements.length,
                        'type': 'path',
                        'd': 'M '+$scope.mouseCoord.x+','+$scope.mouseCoord.y+' ',
                        'shape': 'chain',
                        'name' : '',
                        'angle' : '0',
                        'display' : true,
                        'body_type' : 'static',
                        'body_tag' : '',
                        'body_bullet' : false,
                        'body_angular_damping' : '0.0',
                        'body_linear_damping' : '0.0',
                        'fixture_density' : '0.9',
                        'fixture_restitution' : '0.0'
                    };
                    $scope.elements.push(element);
                    $scope.drawing = true;
                } else { // Update du chemin
                    var currentElement = new Object;
                    currentElement = $scope.elements[Object.keys($scope.elements)[Object.keys($scope.elements).length - 1]];
                    currentElement.d += 'L '+$scope.mouseCoord.x+','+$scope.mouseCoord.y+' ';
                }
                break;
            case 'poly':
                if (!$scope.drawing) { // Début du polygone
                    var element = {
                        'id': $scope.elements.length,
                        'type': 'poly',
                        'd': 'M '+$scope.mouseCoord.x+','+$scope.mouseCoord.y+' ',
                        'shape': 'polygon',
                        'name' : '',
                        'angle' : '0',
                        'display' : true,
                        'body_type' : 'static',
                        'body_tag' : '',
                        'body_bullet' : false,
                        'body_angular_damping' : '0.0',
                        'body_linear_damping' : '0.0',
                        'fixture_density' : '0.9',
                        'fixture_restitution' : '0.0'
                    };
                    $scope.elements.push(element);
                    $scope.drawing = true;
                    $scope.begin = {'x':$scope.mouseCoord.x, 'y':$scope.mouseCoord.y};
                } else { // Update du polygone
                    var currentElement = new Object;
                    currentElement = $scope.elements[Object.keys($scope.elements)[Object.keys($scope.elements).length - 1]];
                    currentElement.d += 'L '+$scope.mouseCoord.x+','+$scope.mouseCoord.y+' ';
                }
                break;
            default:
                break;
        } 
    };
    $scope.actionUpdate = function() {
        if ($scope.drawing) {
            var currentElement = new Object;
            currentElement = $scope.elements[Object.keys($scope.elements)[Object.keys($scope.elements).length - 1]];
            switch ($scope.createType) {
                case 'rect':
                    currentElement.width = Math.abs(currentElement.x - $scope.mouseCoord.x);
                    currentElement.height = Math.abs(currentElement.y - $scope.mouseCoord.y);
                    break;
                case 'circle':
                    currentElement.r = Math.sqrt(Math.pow(currentElement.x - $scope.mouseCoord.x, 2) + Math.pow(currentElement.y - $scope.mouseCoord.y, 2));
                    break;
                default:
                    break;
            } 
            if ($scope.createType === 'resize') {
                var width = null;
                var height = null;
                if (typeof($('.selected').attr('id')) === 'undefined') { // Image
                    var str1 = $('.selected').css('left');
                    var str2 = $('.selected').css('top');
                    width = Math.abs($scope.mouseCoord.x - str1.substring(0, str1.length - 2));
                    height = Math.abs($scope.mouseCoord.y - str2.substring(0, str2.length - 2));
                    $('.selected').attr('width', width);
                    $('.selected').attr('height', height);
                } else if ($scope.elements[$('.selected').attr('id')].type === 'rect') {
                    width = Math.abs($scope.mouseCoord.x - $('.selected').attr('x'));
                    height = Math.abs($scope.mouseCoord.y - $('.selected').attr('y'));
                    $scope.elements[$('.selected').attr('id')].width = width;
                    $scope.elements[$('.selected').attr('id')].height = height;
                } else if ($scope.elements[$('.selected').attr('id')].type === 'circle') {
                    $scope.elements[$('.selected').attr('id')].r = Math.sqrt(Math.pow($scope.elements[$('.selected').attr('id')].x - $scope.mouseCoord.x, 2) + Math.pow($scope.elements[$('.selected').attr('id')].y - $scope.mouseCoord.y, 2));
                }
            } else if ($scope.createType === 'select1') { // Texture
                $('.selected').css('left', parseFloat($('.selected').css('left')) + ($scope.mouseCoord.x - $scope.startMove.x));
                $('.selected').css('top', parseFloat($('.selected').css('top')) + ($scope.mouseCoord.y - $scope.startMove.y));
                console.log($('.selected').css('left'));
                $scope.startMove.x = $scope.mouseCoord.x;
                $scope.startMove.y = $scope.mouseCoord.y;
            } else if($scope.createType === 'select2') { // Element
                if ($('.selected').is('rect')) {
                    $scope.elements[$('.selected').attr('id')].x = parseInt($('.selected').attr('x')) + ($scope.mouseCoord.x - $scope.startMove.x);
                    $scope.elements[$('.selected').attr('id')].y = parseInt($('.selected').attr('y')) + ($scope.mouseCoord.y - $scope.startMove.y);
                }
                else if ($('.selected').is('circle')) {
                    $scope.elements[$('.selected').attr('id')].x = parseInt($('.selected').attr('cx')) + ($scope.mouseCoord.x - $scope.startMove.x);
                    $scope.elements[$('.selected').attr('id')].y = parseInt($('.selected').attr('cy')) + ($scope.mouseCoord.y - $scope.startMove.y);
                }
                else if ($('.selected').is('path')) {
                    var d = $('.selected').attr("d");
                    var coords = d.split(' ');
                    for (var i = 0, c = coords.length; i < c; i++) {
                        if (i % 2 !== 0) {
                            var coord = coords[i].split(',');
                            var x = parseInt(coord[0]) + $scope.mouseCoord.x - $scope.startMove.x;
                            var y = parseInt(coord[1]) + $scope.mouseCoord.y - $scope.startMove.y;
                            coords[i] = x +','+ y;
                        }
                    }
                    $scope.elements[$('.selected').attr('id')].d = coords.join(' ');
                }
                $scope.startMove.x = $scope.mouseCoord.x;
                $scope.startMove.y = $scope.mouseCoord.y;
            }
        }
    };
    $scope.actionEnd = function() {
        if ($scope.drawing) {
            if ($scope.createType !== 'path' && $scope.createType !== 'poly')
                $scope.drawing = false;
            else if ($scope.createType === 'select1' || $scope.createType === 'select2') {
                $scope.drawing = false;
            }
        }
    };
    $scope.actionEndPath = function() {
        if ($scope.drawing) {
            if ($scope.createType === 'poly') {
                var currentElement = new Object;
                currentElement = $scope.elements[Object.keys($scope.elements)[Object.keys($scope.elements).length - 1]];
                currentElement.d += 'Z '+$scope.begin.x+','+$scope.begin.y+' ';
            }
            $scope.drawing = false;
        }
    };
    //Drop uploads
    $scope.imageDropped = function(){
        //Get the file
        var file = $scope.uploadedFile;
        var reader = new FileReader();
        reader.onloadend = function() {
             $scope.textures.push({'src' : reader.result});
        };
        reader.readAsDataURL(file);
        //Clear the uploaded file
        $scope.uploadedFile = null;
    };
    //Sélectionne un élément
    $scope.setSelected = function(e){
        var elem = angular.element(e.srcElement);
        if ($scope.createType === 'select1') {
            $('.selected.texture').attr('class', 'texture');
            elem.addClass('selected');
            $('#svg .selected.poly').attr('class', 'poly');
            $('#svg .selected').attr('class', '');
            $scope.isSelected = true;
            $scope.showResize = true;
        }
        if ($scope.createType === 'select2') {
            $('.selected.texture').attr('class', 'texture');
            $('#svg .selected.poly').attr('class', 'poly');
            $('#svg .selected').attr('class', '');
            elem.addClass('selected');
            $scope.isSelected = $('.selected').attr('id');
            if ($scope.elements[$('.selected').attr('id')].type !== 'poly' && $scope.elements[$('.selected').attr('id')].type !== 'path')
                $scope.showResize = $('.selected').attr('id');
            else
                $scope.showResize = false;
        }
    };
    // Supprimer élément
    $scope.delete = function() {
        if ($('.selected').is('img'))
            $('.selected').remove();
        else
            $scope.elements[$('.selected').attr('id')].display = false;
    };
    // Affichage à partir d'un fichier xml
    $scope.loadXML = function() {
        var xmlDoc = $.parseXML($scope.xml);
        var $xml = $(xmlDoc);
        $scope.origin.cx = parseFloat($xml.find('origin').attr('x'));
        $scope.origin.cy = parseFloat($xml.find('origin').attr('y'));
        $scope.gx = parseFloat($xml.find('world').find('gravity').attr('x'));
        $scope.gy = parseFloat($xml.find('world').find('gravity').attr('y'));
        $scope.player_angular_damping = parseFloat($xml.find('world').find('player').attr('angular_damping'));
        $scope.player_linear_damping = parseFloat($xml.find('world').find('player').attr('linear_damping'));
        $scope.impulse_strength = parseInt($xml.find('world').find('player').attr('impulse_strength'));
        
        $scope.elements = []; 
        $.each($xml.find('object'), function(id, object) {
            if ($xml.find(object).find('shape').attr('type') === 'box') {
                var element = {
                    'id': id,
                    'type': 'rect',
                    'x': parseFloat($xml.find(object).find('body').attr('x')) + $scope.origin.cx - parseFloat($xml.find(object).find('shape').attr('width')),
                    'y': -1 * parseFloat($xml.find(object).find('body').attr('y')) + $scope.origin.cy - parseFloat($xml.find(object).find('shape').attr('height')),
                    'width': parseFloat($xml.find(object).find('shape').attr('width')) * 2,
                    'height': parseFloat($xml.find(object).find('shape').attr('height')) * 2,
                    'shape': 'box',
                    'name' : $xml.find(object).attr('name'),
                    'angle' : parseFloat($xml.find(object).find('body').attr('angle')),
                    'display' : true,
                    'body_type' : $xml.find(object).find('body').attr('type'),
                    'body_tag' : $xml.find(object).find('body').attr('tag'),
                    'body_bullet' : $xml.find(object).find('body').attr('bullet'),
                    'body_angular_damping' : parseFloat($xml.find(object).find('body').attr('angular_damping')),
                    'body_linear_damping' : parseFloat($xml.find(object).find('body').attr('linear_damping')),
                    'fixture_density' : parseFloat($xml.find(object).find('fixture').attr('density')),
                    'fixture_restitution' : parseFloat($xml.find(object).find('fixture').attr('restitution'))
                };
            } else if ($xml.find(object).find('shape').attr('type') === 'circle') {
                var element = {
                    'id': id,
                    'type': 'circle',
                    'x': parseFloat($xml.find(object).find('body').attr('x')) + $scope.origin.cx,
                    'y': -1 * parseFloat($xml.find(object).find('body').attr('y')) + $scope.origin.cy,
                    'r': parseFloat($xml.find(object).find('shape').attr('radius')),
                    'shape': 'circle',
                    'name' : $xml.find(object).attr('name'),
                    'angle' : parseFloat($xml.find(object).find('body').attr('angle')),
                    'display' : true,
                    'body_type' : $xml.find(object).find('body').attr('type'),
                    'body_tag' : $xml.find(object).find('body').attr('tag'),
                    'body_bullet' : $xml.find(object).find('body').attr('bullet'),
                    'body_angular_damping' : parseFloat($xml.find(object).find('body').attr('angular_damping')),
                    'body_linear_damping' : parseFloat($xml.find(object).find('body').attr('linear_damping')),
                    'fixture_density' : parseFloat($xml.find(object).find('fixture').attr('density')),
                    'fixture_restitution' : parseFloat($xml.find(object).find('fixture').attr('restitution'))
                };
            } else if ($xml.find(object).find('shape').attr('type') === 'polygon' || $xml.find(object).find('shape').attr('type') === 'chain') {
                var d = '';
                var key = null;
                var last = '';
                $xml.find(object).find('shape').find('point').each(function() {
                    if ($(this).attr('id') === '0') {
                        key = 'M';
                        last = 'Z '+(parseFloat($(this).attr('x'))+ $scope.origin.cx)+','+(-1 * parseFloat($(this).attr('y')) + $scope.origin.cy)+' ';
                    } else
                        key = 'L';
                    d += key+' '+(parseFloat($(this).attr('x'))+ $scope.origin.cx)+','+(-1 * parseFloat($(this).attr('y')) + $scope.origin.cy)+' ';
                });
                if ($xml.find(object).find('shape').attr('type') === 'polygon')
                    d += last;
                var element = {
                    'id': id,
                    'type': ($xml.find(object).find('shape').attr('type') === 'polygon') ? 'poly' : 'path',
                    'd': d,
                    'shape': $xml.find(object).find('shape').attr('type'),
                    'name' : $xml.find(object).attr('name'),
                    'angle' : parseFloat($xml.find(object).find('body').attr('angle')),
                    'display' : true,
                    'body_type' : $xml.find(object).find('body').attr('type'),
                    'body_tag' : $xml.find(object).find('body').attr('tag'),
                    'body_bullet' : $xml.find(object).find('body').attr('bullet'),
                    'body_angular_damping' : parseFloat($xml.find(object).find('body').attr('angular_damping')),
                    'body_linear_damping' : parseFloat($xml.find(object).find('body').attr('linear_damping')),
                    'fixture_density' : parseFloat($xml.find(object).find('fixture').attr('density')),
                    'fixture_restitution' : parseFloat($xml.find(object).find('fixture').attr('restitution'))
                };
            }
            $scope.elements.push(element);
        });
    };
    // Génération du fichier xml
    $scope.generateXML = function() {
        $scope.xml = '<level name="'+$scope.name+'">';
            $scope.xml += '\n\t<origin x="'+$scope.origin.cx+'" y="'+$scope.origin.cy+'" />';
            $scope.xml += '\n\t<world>';
                $scope.xml += '\n\t\t<gravity x="'+$scope.gx+'" y="'+$scope.gy+'" />';
                $scope.xml += '\n\t\t<player angular_damping="'+$scope.player_angular_damping+'" linear_damping="'+$scope.player_linear_damping+'" impulse_strength="'+$scope.impulse_strength+'" />';
                $scope.xml += '\n\t\t<worldObjects>';
                for (var i = 0; i < $scope.elements.length; i++) {
                    var e = $scope.elements[i];
                    if (e.display) {
                        $scope.xml += '\n\t\t\t<object name="'+e.name+'">';
                            if (e.shape === 'box') { // Rectangle
                                $scope.xml += '\n\t\t\t\t<body type="'+e.body_type+'" x="'+((e.x - $scope.origin.cx)+e.width/2)+'" y="'+(-(e.y - $scope.origin.cy)-e.height/2)+'" tag="'+e.body_tag+'" bullet="'+e.body_bullet+'" angle="'+e.angle+'" angular_damping="'+e.body_angular_damping+'" linear_damping="'+e.body_linear_damping+'" />';
                                $scope.xml += '\n\t\t\t\t<shape type="'+e.shape+'" width="'+e.width/2+'" height="'+e.height/2+'" />';
                            } else if (e.shape === 'circle') { // Cercle
                                $scope.xml += '\n\t\t\t\t<body type="'+e.body_type+'" x="'+(e.x - $scope.origin.cx)+'" y="'+-(e.y - $scope.origin.cy)+'" tag="'+e.body_tag+'" bullet="'+e.body_bullet+'" angle="'+e.angle+'" angular_damping="'+e.body_angular_damping+'" linear_damping="'+e.body_linear_damping+'" />';
                                $scope.xml += '\n\t\t\t\t<shape type="'+e.shape+'" radius="'+e.r+'" />';
                            } else if (e.shape === 'polygon' || e.shape === 'chain') { // Polygone ou chemin
                                $scope.xml += '\n\t\t\t\t<body type="'+e.body_type+'" tag="'+e.body_tag+'" bullet="'+e.body_bullet+'" angle="'+e.angle+'" angular_damping="'+e.body_angular_damping+'" linear_damping="'+e.body_linear_damping+'" />';
                                $scope.xml += '\n\t\t\t\t<shape type="'+e.shape+'">';
                                var coords = e.d.split(' ');
                                var l = null;
                                if (e.shape === 'polygon')
                                    l = coords.length - 3;
                                else
                                    l = coords.length;
                                for (var j = 0; j < l; j++) {
                                    if (j % 2 !== 0) {
                                        var coord = coords[j].split(',');
                                        $scope.xml += '\n\t\t\t\t\t<point id="'+((j-1)/2)+'" x="'+(coord[0] - $scope.origin.cx)+'" y="'+-(coord[1] - $scope.origin.cy)+'" />';
                                    }
                                }
                                $scope.xml += '\n\t\t\t\t</shape>';
                            }
                            $scope.xml += '\n\t\t\t\t<fixture density="'+e.fixture_density+'" restitution="'+e.fixture_restitution+'" />';
                        $scope.xml += '\n\t\t\t</object>';
                    }
                }
                $scope.xml += '\n\t\t</worldObjects>';
            $scope.xml += '\n\t</world>';
            $scope.xml += '\n\t<background>';
                $scope.xml += '\n\t\t<layer image="imagename.png" x="0" y="0" z="0" />';
            $scope.xml += '\n\t</background>';
        $scope.xml += '\n</level>';
    };
});
// Gestion du click gauche
levelBuilder.directive('ngLeftClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngLeftClick);
        element.bind('mousedown', function(event) {
            if (event.button === 0)
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event:event});
                });
        });
    };
});
// Gestion du click droit
levelBuilder.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});
// Gestion des drag & drop d'image
levelBuilder.directive("imagedrop", function ($parse) {
    return {
        restrict: "EA",
        link: function (scope, element, attrs) {
            //The on-image-drop event attribute
            var onImageDrop = $parse(attrs.onImageDrop);
            var onDragOver = function (e) {
                e.preventDefault();
                $('body').addClass("dragOver");
            };
            //When the user leaves the window, cancels the drag or drops the item
            var onDragEnd = function (e) {
                e.preventDefault();
                $('body').removeClass("dragOver");
            };
            //When a file is dropped on the overlay
            var loadFile = function (file) {
                scope.uploadedFile = file;
                scope.$apply(onImageDrop(scope));
            };
            //Dragging begins on the document (shows the overlay)
            $(document).bind("dragover", onDragOver);
            //Dragging ends on the overlay, which takes the whole window
            element.bind("dragleave", onDragEnd)
                .bind("drop", function (e) {
                    onDragEnd(e);   
                    loadFile(e.dataTransfer.files[0]); /* This is the file */
                });
        }
    };
});