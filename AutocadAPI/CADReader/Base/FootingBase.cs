﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using devDept.Geometry;
using devDept.Eyeshot.Entities;

namespace CADReader.Base
{
   public abstract class FootingBase
    {
        public string Type { get; protected set; }
        
        public double Thickness { get; set; }

        public LinearPath ProfilePath { get; set; }

        
    }
}
