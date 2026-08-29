import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "../context/LocaleProvider";
import {
  MasterCvProfilePhotoField,
  profilePhotoPositionAfterDrag,
} from "./MasterCvProfilePhotoField";

describe("Master CV profile photo positioning", () => {
  it("maps drag movement to bounded focal percentages", () => {
    expect(profilePhotoPositionAfterDrag(50, 50, -36, 36, 144, 144)).toEqual({
      positionX: 75,
      positionY: 25,
    });
    expect(profilePhotoPositionAfterDrag(50, 50, 500, -500, 144, 144)).toEqual({
      positionX: 0,
      positionY: 100,
    });
  });

  it("keeps drag actions beside the photo without manual position controls", () => {
    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <MasterCvProfilePhotoField
          persistence="immediate"
          assetId="7e9c843b-5c3d-4e65-8514-7de898b2aca6"
          positionX={25}
          positionY={75}
          onPhotoChange={() => undefined}
          pendingFile={null}
          onPendingFileChange={() => undefined}
        />
      </LocaleProvider>,
    );

    expect(markup).not.toContain('type="range"');
    expect(markup).not.toContain("Posición horizontal");
    expect(markup).not.toContain("Posición vertical");
    expect(markup).not.toContain("Centrar foto");
    expect(markup).not.toContain("Restablecer posición");
    expect(markup).toContain("Arrastra la foto para posicionarla.");
    expect(markup).toContain("Guardar posición");
    expect(markup).toContain("Reemplazar foto");
    expect(markup).toContain("Quitar foto");
    expect(markup).toContain(
      'class="flex flex-col items-start gap-3" data-profile-photo-actions',
    );
    expect(markup).not.toContain("<img");
  });
});
