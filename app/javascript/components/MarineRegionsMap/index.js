import React from "react"
import PropTypes from "prop-types"
import 'ol/ol.css';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import './style.scss'
import Map from 'ol/Map';
import View from 'ol/View';
import LayerGroup from 'ol/layer/Group';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import Feature from 'ol/Feature';
import ImageWMS from 'ol/source/ImageWMS';
import SourceImageArcGISRest from 'ol/source/ImageArcGISRest';
import SourceOSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import LayerSwitcher from 'ol-layerswitcher';
import Point from 'ol/geom/Point';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {fromLonLat} from 'ol/proj';

// http://www.marineregions.org/webservices.php
const LONGHURST_WMS_URL = "https://geo.vliz.be/geoserver/MarineRegions/wms";
// https://data.unep-wcmc.org/
const PPOW_MEOW_URL = "https://gis.unep-wcmc.org/arcgis/rest/services/marine/WCMC_036_MEOW_PPOW_2007_2012/MapServer"

class MarineRegionsMap extends React.Component {
  constructor(props) {
    super(props);
    this.mapContainerRef = React.createRef();
    this.state = { map: {} };
  }

  componentDidMount() {
    const longhurstWMSImageLayer = new ImageLayer({
      title: "Longhurst Provinces",
      source: new ImageWMS({
        url: LONGHURST_WMS_URL,
        params: {},
        serverType: 'geoserver',
        crossOrigin: 'anonymous'
      })
    });

    const ppoe_meow = new ImageLayer({
      title: 'Marine Ecoregions of the World',
      source: new SourceImageArcGISRest({
        ratio: 1,
        params: {},
        url: PPOW_MEOW_URL,
        projection: 'EPSG:4326'
      })
    })

    // https://openlayers.org/en/latest/doc/faq.html#why-is-the-order-of-a-coordinate-lon-lat-and-not-lat-lon-
    const trendCoordinates = [this.props.longitude, this.props.latitude]
    const trendLocation = fromLonLat(trendCoordinates);

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [
          new Feature({
            type: 'geoMarker',
            geometry: new Point(trendLocation)
          })
        ]}),
      style: new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({color: 'black'}),
          stroke: new Stroke({
            color: 'white', width: 2
          })
        })
      })
    });

    const map = new Map({
      target: this.mapContainerRef.current,
      layers: [
        new LayerGroup({
          'title': 'Base map',
          layers: [
            new TileLayer({
              title: 'OSM',
              type: 'base',
              visible: true,
              source: new SourceOSM()
            })
          ]
        }),
        new LayerGroup({
          title: 'Marine Regions',
          layers: [ ppoe_meow, longhurstWMSImageLayer ]
        }),
        new LayerGroup({
          layers: [ vectorLayer ]
        }),
      ],
      view: new View({
        center: trendLocation,
        zoom: 6
      })
    });

    const layerSwitcher = new LayerSwitcher();
    map.addControl(layerSwitcher);

    this.setState({
      map: map,
    });
  }

  render() {
    return(
      <div ref={this.mapContainerRef} className="longhurtsMap"></div>
    )
  }
}

MarineRegionsMap.propTypes = {
  latitude: PropTypes.string,
  longitude: PropTypes.string,
};
export default MarineRegionsMap
