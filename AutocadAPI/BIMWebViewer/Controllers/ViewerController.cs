﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using Xbim.Ifc;
using Xbim.Ifc4.Interfaces;
using Xbim.ModelGeometry.Scene;
using BIMWebViewer.Classes;
using System.Drawing;
using Newtonsoft.Json;
using Xbim.IO;
using Xbim.Ifc4.Kernel;
using Xbim.ModelGeometry.Scene.Extensions;
using Newtonsoft.Json.Serialization;
using CADReader.BuildingElements;
using IfcFileCreator;
using Xbim.Ifc4.SharedComponentElements;
using Xbim.Ifc4.StructuralElementsDomain;
using devDept.Geometry;
using Xbim.Ifc4.SharedBldgElements;

namespace BIMWebViewer.Controllers
{
    //[Authorize]
    public class ViewerController : Controller
    {
        static XbimCreateBuilding newBuilding;
        static int counter = 0;
        List<object> ElementIDsToRenders = new List<object>();
        // GET: Upload
        public ActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public ActionResult UploadFile()
        {
            return View();
        }

        public ActionResult Viewer()
        {
            var filePath = "";

            filePath = TempData["wexbimFilePath"].ToString();
            //// file = TempData["wexbimFilePath"].ToString();
            ViewBag.FilePath = filePath;
            ViewBag.VersionName = TempData["VersionName"].ToString();
            if (TempData["ViewPoints"] != null)
                ViewBag.ViewPoints = TempData["ViewPoints"];

            List<ProductCategory> categories = IFCConverter.Categories;
            return View(categories);
        }


        public ActionResult ViewerLoad(string FileName)
        {
            return File(FileName, "application/octet-stream", FileName);
        }

        public ActionResult BrowserLoad(string FileName)
        {
            return File(FileName, "application/json", FileName);
        }

        [HttpPost]
        public ActionResult GetProperties(int productId)
        {
            if (IFCConverter.propertySetsx4 != null)
            {
                if (IFCConverter.propertySetsx4.ContainsKey(productId))
                    return PartialView("ProductProperties", IFCConverter.propertySetsx4[productId]);
            }

            else
            {
                if (IFCConverter.propertySets2x3.ContainsKey(productId))
                    return PartialView("ProductProperties2x3", IFCConverter.propertySets2x3[productId]);
            }


            return new EmptyResult();
        }
        public ActionResult PreviewModel(string versionPath)
        {
            var CADFileDirectoryBuildingA = $"{Server.MapPath("~")}\\CAD Files\\BuildingA";
            //var CADFileDirectoryBuildingB = $"{Server.MapPath("~")}\\CAD Files\\BuildingB";
            List<string> cadfilesBuildingA = Directory.GetFiles(CADFileDirectoryBuildingA).ToList();
            //var cadfilesBuildingB = Directory.GetFiles(CADFileDirectoryBuildingB).ToList();
            //Building buildingA = new Building("Building A", new Point3D(0, 0, 0));
            Building buildingA2 = new Building("Building A", new Point3D(0, 0, 0), 0);

            //Building buildingB = new Building("Building B", new Point3D(500, 0, 0));
            //building.AddNewFloor(cadfiles.Where(e=>e.Contains("Ground")).FirstOrDefault(), 3);
            //buildingA.AddNewFloor(cadfilesBuildingA.Where(e => e.Contains("Ground")).FirstOrDefault(), 3);
            // buildingA.AddNewFloor(cadfilesBuildingA.Where(e => e.Contains("Basement")).FirstOrDefault(), 0);

            {//new
                buildingA2.AddBuildingFoundation(cadfilesBuildingA.Where(b => b.Contains("Foundation")).FirstOrDefault(), 0, 0);
                buildingA2.AddNewFloor(cadfilesBuildingA.Where(b => b.Contains("Basement")).FirstOrDefault(), 4.95, 4.95);
                buildingA2.AddNewFloor(cadfilesBuildingA.Where(b => b.Contains("Ground")).FirstOrDefault(), 8.75, 3.8);
                buildingA2.AddNewFloor(cadfilesBuildingA.Where(b => b.Contains("1st")).FirstOrDefault(), 11.75, 3);
                buildingA2.AddNewFloor(cadfilesBuildingA.Where(b => b.Contains("2nd")).FirstOrDefault(), 14.75, 3);
                buildingA2.AddNewFloor(cadfilesBuildingA.Where(b => b.Contains("3rd")).FirstOrDefault(), 17.75, 3);
                buildingA2.AddNewFloor(cadfilesBuildingA.Where(b => b.Contains("4th")).FirstOrDefault(), 20.75, 3);
                buildingA2.AddNewFloor(cadfilesBuildingA.Where(b => b.Contains("5th")).FirstOrDefault(), 23.75, 3);
                buildingA2.AddNewFloor(cadfilesBuildingA.Where(b => b.Contains("6th")).FirstOrDefault(), 26.75, 3);
                buildingA2.AddNewFloor(cadfilesBuildingA.Where(b => b.Contains("Roof Floor")).FirstOrDefault(), 29.75, 3);
                buildingA2.AddNewFloor(cadfilesBuildingA.Where(b => b.Contains("UpRoof")).FirstOrDefault(), 32.75, 3);
                //buildingA2.AddNewFloor(cadfilesBuildingA.Where(b => b.Contains("Ground")).FirstOrDefault(), 3, 3); //top level = lvl + height
            }
            //buildingA.AddBuildingFoundation(cadfilesBuildingA.Where(e => e.Contains("Foundation")).FirstOrDefault(),4.50, 0.2);

            //buildingB.AddNewFloor(cadfilesBuildingB.Where(e => e.sContains("Basement")).FirstOrDefault(), 0);
            //buildingB.AddBuildingFoundation(cadfilesBuildingB.Where(e => e.Contains("Foundation")).FirstOrDefault(), -4);

            newBuilding = new XbimCreateBuilding(buildingA2, versionPath);
            List<string> files = Directory.GetFiles(versionPath).ToList();
            // string wexFile = files.Where(a => Path.GetExtension(a) == ".wexBIM").FirstOrDefault();
            List<string> lstIfcFile = files.Where(a => Path.GetExtension(a) == ".ifc").ToList();
            //string wexFile = files.Where(a => Path.GetExtension(a) == ".wexBIM").FirstOrDefault();
            string wexFile = files.Where(a => Path.GetExtension(a) == ".wexBIM").FirstOrDefault();
            var verName = Path.GetFileName(versionPath);
            var proName = Path.GetFileName(Path.GetDirectoryName(versionPath));
            FileStruc.CurrentVersion = versionPath;

            TempData["VersionName"] = proName + "/" + verName;

            if (wexFile != null)
            {
                TempData["wexbimFilePath"] = wexFile;
                IFCConverter.CreateTree(lstIfcFile[0]);
            }
            else
            {
                string newPath = null;
                for (int i = 0; i < lstIfcFile.Count; i++)
                {
                    string ifcFile = files.Where(a => Path.GetExtension(a) == ".ifc").ToList()[i];
                    newPath = IFCConverter.ToWexBIM(ifcFile);
                }

                TempData["wexbimFilePath"] = newPath;
                TempData["IFCFilePath"] = lstIfcFile[0];

            }

            //RedirectToAction("Viewer");

            return RedirectToAction("Viewer");
        }
        [HttpPost]
        public ActionResult GetElemetsToRender()
        {
            if (newBuilding.BuildingSubmissions.SubmittedElems.Count == counter)
            {
                return new EmptyResult();
            }
            if (newBuilding.BuildingSubmissions.SubmittedElems[counter].Count != 0)
                ElementIDsToRenders.AddRange(newBuilding.BuildingSubmissions.SubmittedElems[counter].Select(p => new { Id = p.EntityLabel, isFormWork = p is IfcBuildingElementPart, isConcrete = p is IfcBeam || p is IfcColumn || p is IfcSlab || p is IfcFooting || p is IfcWallStandardCase }));
            //ElementIDsToRenders.AddRange(newBuilding.BuildingSubmissions.SubmittedElems[counter].Select(p => new {Id= p.EntityLabel,  isFormWork= p is IfcBuildingElementPart, isReinforcement = p is IfcReinforcingBar }));
            counter++;
            JsonResult result = new JsonResult();
            var jsonData = new { ProductIdList = ElementIDsToRenders };
            var serializerSettings = new JsonSerializerSettings { PreserveReferencesHandling = PreserveReferencesHandling.Objects };
            return new JsonResult
            {
                Data = JsonConvert.SerializeObject(jsonData, Formatting.Indented, serializerSettings),
                MaxJsonLength = Int32.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };

        }
        [HttpPost]
        public void ResetCounter()
        {
            counter = 0;
        }
        [HttpPost]
        public void UploadPic(string imageData, string name)
        {
            var path = Path.Combine(FileStruc.CurrentVersion, name + ".png");
            //  string Pic_Path = HttpContext.Server.MapPath("~/");
            using (FileStream fs = new FileStream(path, FileMode.Create))
            {
                using (BinaryWriter bw = new BinaryWriter(fs))
                {
                    byte[] data = Convert.FromBase64String(imageData);
                    bw.Write(data);
                    bw.Close();
                }
            }
        }

        [HttpPost]
        public ActionResult SaveViewList(string viewList)
        {
            var currentVersionPath = FileStruc.CurrentVersion;
            System.IO.File.WriteAllText(currentVersionPath + @"\viewList.json", viewList);

            return RedirectToAction("Viewer");
        }
        public ActionResult GetViewPoints()
        {
            List<string> files = Directory.GetFiles(FileStruc.CurrentVersion).ToList();
            string ViewListPath = files.Where(a => Path.GetExtension(a) == ".json").FirstOrDefault();
            string ViewListstring = "";
            if (ViewListPath != null)
            {
                ViewListstring = System.IO.File.ReadAllText(ViewListPath);
            }
            JsonResult result = new JsonResult();
            var jsonData = new { ViewPointsList = ViewListstring };
            var serializerSettings = new JsonSerializerSettings { PreserveReferencesHandling = PreserveReferencesHandling.Objects };
            return new JsonResult { Data = JsonConvert.SerializeObject(jsonData, Formatting.Indented, serializerSettings), MaxJsonLength = Int32.MaxValue, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }


        [HttpPost]
        public ActionResult GetProductIdsByType(int TypeId)
        {
            IIfcRelDefinesByType relType = IFCConverter.ModelTypes.Where(t => t.RelatingType.EntityLabel == TypeId).FirstOrDefault();
            List<int> productIds = new List<int>();
            if (relType != null)
                productIds = relType.RelatedObjects.Select(a => a.EntityLabel).ToList();
            JsonResult result = new JsonResult();
            var jsonData = new { ProductIdList = productIds };
            var serializerSettings = new JsonSerializerSettings { PreserveReferencesHandling = PreserveReferencesHandling.Objects };
            return new JsonResult { Data = JsonConvert.SerializeObject(jsonData, Formatting.Indented, serializerSettings), MaxJsonLength = Int32.MaxValue, JsonRequestBehavior = JsonRequestBehavior.AllowGet };

        }
        [HttpGet]
        public ActionResult GetAllProductIds()
        {

            List<int> productIds = IFCConverter.Products.Select(p => p.EntityLabel).ToList();

            JsonResult result = new JsonResult();
            var jsonData = new { ProductIdList = productIds };
            var serializerSettings = new JsonSerializerSettings { PreserveReferencesHandling = PreserveReferencesHandling.Objects };
            return new JsonResult { Data = JsonConvert.SerializeObject(jsonData, Formatting.Indented, serializerSettings), MaxJsonLength = Int32.MaxValue, JsonRequestBehavior = JsonRequestBehavior.AllowGet };

        }
        [HttpPost]
        public string GetProductId(int selectedLabel)
        {

            IIfcProduct Product = IFCConverter.Products.Where(p => p.EntityLabel == selectedLabel).FirstOrDefault();
            if (Product != null)
            {
                string ProductId = Product.Name.Value.Value.ToString().Split(':')[2];
                return ProductId;
            }
            else
            {
                IIfcRelDefinesByType relType = IFCConverter.ModelTypes.Where(t => t.RelatingType.EntityLabel == selectedLabel).FirstOrDefault();
                string typeName = relType.RelatingType.Name.ToString();
                return typeName;
            }

        }
    }
}