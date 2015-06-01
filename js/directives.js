'use strict';

angular.module('app.directives', [])
    .directive('d3Bubbles', [
        function() {
            return {
                restrict: 'EA',
                scope: {
                    data: '='
                },
                link: function(scope, iElement, iAttrs) {

                    var width = 1200,
                        height = 1000,
                        padding = 1.5,
                        clusterPadding = 20,
                        maxRadius = 5;


                    var svg = d3.select(iElement[0])
                        .append('svg')
                        .attr('viewBox', '0 0 ' + width + ' ' + height)
                        .attr('preserveAspectRatio', 'xMinYMid meet');

                    window.onresize = function() {
                        return scope.$apply();
                    };
                    scope.$watch(function() {
                        return angular.element(window)[0].innerWidth;
                    }, function() {
                        return scope.render(scope.data);
                    });
                    scope.$watch('data', function(newVals, oldVals) {
                        return scope.render(newVals);
                    }, true);


                    scope.render = function(data) {

                        if (angular.isUndefined(data)) {
                            return;
                        }

                        var div = d3.select('body').append('div')
                            .attr('class', 'tooltip')
                            .style('opacity', 1);

                        var m = 7;
                        svg.selectAll('*').remove();
                        var color = d3.scale.category10()
                            .domain(d3.range(m));

                        // The largest node for each cluster.
                        var clusters = new Array(m);

                        var nodes = data.map(function(data) {
                            var i = Math.round(data.spi / 10),
                                r = data.spi * 1,
                                d = {
                                    cluster: i,
                                    radius: r,
                                    x: (function() {
                                        return Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random();
                                    })(),
                                    y: (function() {
                                        return Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random();
                                    })(),
                                    name: data.country,
                                    score: (function() {
                                        return data.spi;
                                    })(),
                                    theaters: (function() {
                                        return data.theaters;
                                    })()
                                };
                            if (!clusters[i] || (r > clusters[i].radius)) {
                                clusters[i] = d;
                            }
                            return d;
                        });

                        function tick(e) {
                            node.each(cluster(10 * e.alpha * e.alpha))
                                .each(collide(0.5))
                                .attr('cx', function(d) {
                                    return d.x;
                                })
                                .attr('cy', function(d) {
                                    return d.y;
                                });

                            text.each(cluster(10 * e.alpha * e.alpha))
                                .each(collide(0.5))
                                .attr('dx', function(d) {
                                    return d.x;
                                })
                                .attr('dy', function(d) {
                                    return d.y;
                                });
                        }

                        var force = d3.layout.force()
                            .nodes(nodes)
                            .size([width, height])
                            .gravity(0.02)
                            .charge(0.0)
                            .on('tick', tick)
                            .start();

                        var elem = svg.selectAll('g')
                            .data(nodes).enter().append('g');

                        var node = elem
                            .data(nodes)
                            .append('circle')
                            .style('fill', function(d) {
                                return color(d.cluster);
                            })
                            .call(force.drag);

                        node.transition()
                            .duration(750)
                            .delay(function(d, i) {
                                return i * 5;
                            })
                            .attrTween('r', function(d) {
                                var i = d3.interpolate(0.0, d.radius);
                                return function(t) {
                                    d.radius = i(t);
                                    return d.radius;
                                };
                            });


                        var text = elem
                            .data(nodes)
                            .append('text');


                        var textLabels = text
                            .text(function(d) {
                                return d.name;
                            })
                            .attr('dx', function(d) {
                                return d.x;
                            })
                            .attr('dy', function(d) {
                                return d.y;
                            })
                            .attr('font-family', 'sans-serif')
                            .attr('font-size', '10px')
                            .attr('font-weight', 'bold')
                            .attr('text-anchor', 'middle')
                            .attr('textLength', function(d) {
                                return d.r > 100 ? 100 : d.r;
                            })
                            .attr('fill', 'white');

                        // Move d to be adjacent to the cluster node.
                        function cluster(alpha) {
                            return function(d) {
                                var cluster = clusters[d.cluster];
                                if (cluster === d) {
                                    return;
                                }
                                var x = d.x - cluster.x,
                                    y = d.y - cluster.y,
                                    l = Math.sqrt(x * x + y * y),
                                    r = d.radius + cluster.radius;
                                if (l !== r) {
                                    l = (l - r) / l * alpha;
                                    d.x -= x *= l;
                                    d.y -= y *= l;
                                    cluster.x += x;
                                    cluster.y += y;
                                }
                            };
                        }

                        // Resolves collisions between d and all other circles.
                        function collide(alpha) {
                            var quadtree = d3.geom.quadtree(nodes);
                            return function(d) {
                                var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                                    nx1 = d.x - r,
                                    nx2 = d.x + r,
                                    ny1 = d.y - r,
                                    ny2 = d.y + r;
                                quadtree.visit(function(quad, x1, y1, x2, y2) {
                                    if (quad.point && (quad.point !== d)) {
                                        var x = d.x - quad.point.x,
                                            y = d.y - quad.point.y,
                                            l = Math.sqrt(x * x + y * y),
                                            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                                        if (l < r) {
                                            l = (l - r) / l * alpha;
                                            d.x -= x *= l;
                                            d.y -= y *= l;
                                            quad.point.x += x;
                                            quad.point.y += y;
                                        }
                                    }
                                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                                });
                            };
                        }
                    };
                }
            };
        }
    ]);
