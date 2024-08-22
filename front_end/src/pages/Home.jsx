import { useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

import PdfGenerator from "./Processing/PdfGenerator";

export default function Home() {
  const position = { lat: 53.54, lng: 10 };
  const MAR_position = { lat: 29.644055, lng: -8.735843 };
  const pos2 = { lat: 33.082821, lng: -8.616901 };
  const API_KEY = "AIzaSyCm_OOEW0UaqOveQEPmRl7rr1Vbw53HQ9k";
  const MapID = "16d0106d04e96ce1";
  const [open, setOpen] = useState(false);

  const mapStyles = [
    {
      featureType: "administrative.country",
      elementType: "labels.text",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
  ];
  return (
    <>
      <APIProvider apiKey={API_KEY}>
        <div className="mt-20 h-[500px] w-full">
          <Map
            mapId={MapID}
            defaultZoom={4}
            defaultCenter={MAR_position}
            mapTypeId="satellite" // Set the map type to satellite
            options={{
              styles: mapStyles,
              gestureHandling: "auto", // Ensure gestures like zoom and pan are enabled
              // zoomControl: true, // Ensure zoom control is visible
              mapTypeControl: false,
            }} // Apply custom styles to hide labels
          >
            <AdvancedMarker
              position={MAR_position}
              onClick={() => setOpen(true)}
            >
              <Pin
                background={"#f97316"}
                borderColor={"#f97316"}
                glyphColor={"black"}
              />
            </AdvancedMarker>

            <AdvancedMarker position={pos2} onClick={() => setOpen(true)}>
              <Pin
                background={"#f97316"}
                borderColor={"#f97316"}
                glyphColor={"black"}
              />
            </AdvancedMarker>

            {open && (
              <InfoWindow
                position={MAR_position}
                onCloseClick={() => setOpen(false)}
              >
                <p>
                  Spectral Data in .. Spectral Data in .. Spectral Data in ..{" "}
                </p>
                <p>Spectral Data in ..</p>
                <p>Spectral Data in ..</p>
              </InfoWindow>
            )}
          </Map>
        </div>
      </APIProvider>
    </>
  );
}
