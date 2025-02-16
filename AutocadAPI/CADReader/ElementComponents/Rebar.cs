﻿using CADReader.Helpers;
using devDept.Eyeshot.Entities;
using devDept.Geometry;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CADReader.ElementComponents
{
    public class Rebar
    {
        #region Properties
        public string Type { get; set; }
        public LinearPath LinearPath { get; set; }
        public Point3D LocationPt { get; set; }

        public double Diameter { get; set; } = DefaultValues.BarDiameter;
        #endregion
        #region Constructors
        public Rebar(Point3D location)
        {
            LocationPt = location;
            Type = "vertical";
        }

        public Rebar(LinearPath path)
        {
            this.LinearPath = path;
            Type = "horizontal";
        } 
        #endregion

       

    }
}
