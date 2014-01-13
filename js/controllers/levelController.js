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
    $scope.offset = {'x': 42, 'y': 151};
    $scope.setCreateType = function(type) {
        $scope.createType = type;
        $scope.drawing = false;
        $('.selected.texture').attr('class', 'texture');
        $('#svg .selected.poly').attr('class', 'poly');
        $('#svg .selected').attr('class', '');
    };
    $scope.setMouseCoord = function(event) {
        $scope.mouseCoord.x = event.clientX - $scope.offset.x;
        $scope.mouseCoord.y = event.clientY - $scope.offset.y;
        $scope.planCoord.x = -($scope.origin.cx - event.clientX) - $scope.offset.x;
        $scope.planCoord.y = $scope.origin.cy - event.clientY + $scope.offset.y;
    };
    $scope.actionBegin = function() {
        // console.log($scope.elements);
        switch ($scope.createType) {
            case 'select1':
            case 'select2':
                $scope.startMove.x = $scope.mouseCoord.x;
                $scope.startMove.y = $scope.mouseCoord.y;
                $scope.drawing = true;
                break;
            case 'origin':
                $scope.origin.cx = $scope.mouseCoord.x;
                $scope.origin.cy = $scope.mouseCoord.y;
                break;
            case 'rect':
                var element = {
                    'id': $scope.elements.length,
                    'type': 'rect',
                    'x': $scope.mouseCoord.x,
                    'y': $scope.mouseCoord.y
                };
                $scope.elements.push(element);
                $scope.drawing = true;
                break;
            case 'circle':
                var element = {
                    'id': $scope.elements.length,
                    'type': 'circle',
                    'x': $scope.mouseCoord.x,
                    'y': $scope.mouseCoord.y
                };
                $scope.elements.push(element);
                $scope.drawing = true;
                break;
            case 'path':
                if (!$scope.drawing) { // Début du chemin
                    var element = {
                        'id': $scope.elements.length,
                        'type': 'path',
                        'd': 'M '+$scope.mouseCoord.x+','+$scope.mouseCoord.y+' '
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
                        'd': 'M '+$scope.mouseCoord.x+','+$scope.mouseCoord.y+' '
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
            if ($scope.createType === 'select1') {
                $('.selected').css('left', parseInt($('.selected').css('left')) + ($scope.mouseCoord.x - $scope.startMove.x));
                $('.selected').css('top', parseInt($('.selected').css('top')) + ($scope.mouseCoord.y - $scope.startMove.y));
                $scope.startMove.x = $scope.mouseCoord.x;
                $scope.startMove.y = $scope.mouseCoord.y;
            } else if($scope.createType === 'select2') {
                if ($('.selected').is('rect')) {
                    $('.selected').attr('x', parseInt($('.selected').attr('x')) + ($scope.mouseCoord.x - $scope.startMove.x));
                    $('.selected').attr('y', parseInt($('.selected').attr('y')) + ($scope.mouseCoord.y - $scope.startMove.y));
                }
                else if ($('.selected').is('circle')) {
                    $('.selected').attr('cx', parseInt($('.selected').attr('cx')) + ($scope.mouseCoord.x - $scope.startMove.x));
                    $('.selected').attr('cy', parseInt($('.selected').attr('cy')) + ($scope.mouseCoord.y - $scope.startMove.y));
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
                    $('#svg .selected').attr('d', coords.join(' '));
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
        }
        if ($scope.createType === 'select2') {
            $('.selected.texture').attr('class', 'texture');
            $('#svg .selected.poly').attr('class', 'poly');
            $('#svg .selected').attr('class', '');
            elem.addClass('selected');
        }
    };
    // Génération du fichier xml
    $scope.generateXML = function() {
        $scope.xml = '<level name="'+$scope.name+'">';
            $scope.xml += '\n\t<world>';
                $scope.xml += '\n\t\t<gravity x="'+$scope.gx+'" y="'+$scope.gy+'" />';
                $scope.xml += '\n\t\t<worldObjects>';
                for (var i = 0, c = $scope.elements.length; i < c; i++) {
                    var e = $scope.elements[i];
                    $scope.xml += '\n\t\t\t<object name="'+e.name+'">';
                        $scope.xml += '\n\t\t\t\t<body type="'+e.behaviour+'" x="'+(e.x - $scope.origin.cx)+'" y="'+(e.y - $scope.origin.cy)+'" tag="'+e.tag+'" bullet="'+e.isBullet+'" angle="'+e.angle+'" angular_damping="'+e.angular_damping+'" linear_damping="'+e.linear_damping+'" />';
                        $scope.xml += '\n\t\t\t\t<shape type="'+e.shape+'" width="'+e.width+'" height="'+e.height+'" />';
                        $scope.xml += '\n\t\t\t\t<fixture density="'+e.density+'" restitution="'+e.restitution+'" />';
                    $scope.xml += '\n\t\t\t</object>';
                }
                $scope.xml += '\n\t\t</worldObjects>';
            $scope.xml += '\n\t</world>';
            $scope.xml += '\n\t<background>';
                $scope.xml += '\n\t\t<layer image="imagename.png" x="0" y="0" z="0" />';
            $scope.xml += '\n\t</background>';
        $scope.xml += '\n</level>';
        $('#xml').html($scope.xml);
    };
    $scope.generateXML();
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