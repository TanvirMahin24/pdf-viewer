const { default: WebViewer } = require("@pdftron/webviewer");
const fs = require("fs");
const { dialog } = require("electron").remote;

const viewerElement = document.getElementById("viewer");
const saveBtn = document.getElementById("save");
const openBtn = document.getElementById("open");

WebViewer(
  {
    path: "../public/lib",
  },
  viewerElement
).then((instance) => {
  instance.setTheme("dark");
  instance.disableElements(["downloadButton"]);

  const { docViewer, annotManager } = instance;

  openBtn.onclick = async () => {
    const file = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "Documents", extensions: ["pdf", "docx", "xlsx", "pptx"] },
        { name: "Images", extensions: ["png", "jpg", "jpeg"] },
      ],
    });

    if (!file.canceled) {
      instance.loadDocument(file.filePaths[0]);
    }
  };

  saveBtn.onclick = async () => {
    const file = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "Select the location you want to save the PDF",
      buttonLabel: "Save",
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (!file.canceled) {
      const doc = docViewer.getDocument();
      const xfdfString = await annotManager.exportAnnotations();
      const data = await doc.getFileData({
        xfdfString,
      });
      const arr = new Uint8Array(data);
      fs.writeFile(
        `${file.filePaths[0].toString()}/modified.pdf`,
        arr,
        function (err) {
          if (err) throw err;
          console.log("Saved");
        }
      );
    }
  };
});
