import p5 from "p5";

const width: number = 800;
const height: number = 500;
const padding: number = 50;

let sketch = function (p) {
  p.setup = function () {
    p.createCanvas(width, height);

    p.strokeWeight(3);
    p.stroke("blue");

    // x and y axes
    p.line(padding, padding, padding, height - padding);
    p.line(padding, height - padding, width - padding, height - padding);

    // y-axis arrow head
    p.line(padding, padding, padding - 5, padding + 5);
    p.line(padding, padding, padding + 5, padding + 5);

    // x-axis arrow head
    p.line(
      width - padding,
      height - padding,
      width - padding - 5,
      height - padding + 5
    );
    p.line(
      width - padding,
      height - padding,
      width - padding - 5,
      height - padding - 5
    );

    p.strokeWeight(0);
    p.text("(0, 0)", padding + 10, height - 30);
  };

  class Point {
    x: number;
    y: number;
    p;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    draw(): void {
      // DO NOT MODIFY

      p.stroke("black");
      p.strokeWeight(800);
      p.point(this.x, this.y);
    }

    drawTo(that: Point) {
      // DO NOT MODIFY

      p.stroke("black");
      p.strokeWeight(200);
      p.line(this.x, this.y, that.x, that.y);
    }

    slopeTo(other) {
      if (this.x === other.x && this.y === other.y) return -Infinity;
      if (this.x === other.x) return Infinity;
      if (this.y === other.y) return 0;
      return (other.y - this.y) / (other.x - this.x);
    }
  }

  class LineSegment {
    p: Point;
    q: Point;

    constructor(p: Point, q: Point) {
      // DO NOT MODIFY

      this.p = p;
      this.q = q;
    }

    draw(): void {
      // DO NOT MODIFY

      p.stroke("black");
      p.strokeWeight(2);
      p.line(this.p.x, this.p.y, this.q.x, this.q.y);
    }

    toString(): string {
      // DO NOT MODIFY

      return `${this.p} -> ${this.q}`;
    }
  }

  class BruteCollinearPoints {
    private points: Point[];

    constructor(points: Point[]) {
      // YOUR CODE HERE

      this.points = points;
    }

    numberOfSegments(): number {
      // YOUR CODE HERE

      const segments = this.segments();
      return segments.length;
    }

    segments(): LineSegment[] {
      // YOUR CODE HERE

      console.time("BruteCollinearPoints");

      const segments: LineSegment[] = [];

      for (let i = 0; i < this.points.length - 3; i++) {
        for (let j = i + 1; j < this.points.length - 2; j++) {
          for (let k = j + 1; k < this.points.length - 1; k++) {
            for (let l = k + 1; l < this.points.length; l++) {
              const p = this.points[i];
              const q = this.points[j];
              const r = this.points[k];
              const s = this.points[l];

              // Check if collinear
              if (this.areCollinear(p, q, r, s)) {
                const segment = new LineSegment(p, s);
                segments.push(segment);
              }
            }
          }
        }
      }
      console.timeEnd("BruteCollinearPoints");
      return segments;
    }

    private areCollinear(p: Point, q: Point, r: Point, s: Point): boolean {
      const pqSlope = p.slopeTo(q);
      const prSlope = p.slopeTo(r);
      const psSlope = p.slopeTo(s);

      if (pqSlope === prSlope && pqSlope === psSlope) {
        if (
          pqSlope === Number.POSITIVE_INFINITY ||
          pqSlope === Number.NEGATIVE_INFINITY
        ) {
          return p.x === q.x && p.x === r.x && p.x === s.x;
        } else {
          return true;
        }
      }

      return false;
    }
  }

  class FastCollinearPoints {
    private segmentsArray: LineSegment[];

    constructor(private points: Point[]) {
      // YOUR CODE HERE

      if (!points || points.some((p) => !p)) {
        throw new Error(
          "Constructor cannot be null and should not contain null points."
        );
      }
      this.segmentsArray = [];
      this.computeSegments();
    }

    numberOfSegments(): number {
      // YOUR CODE HERE

      return this.segmentsArray.length;
    }

    segments(): LineSegment[] {
      // YOUR CODE HERE

      return this.segmentsArray.slice();
    }

    private computeSegments() {
      console.time("Points");
      const points = this.points;
      const n = points.length;

      const sortedPoints = mergeSort(points, (a, b) => {
        if (a.x !== b.x) return a.x - b.x;
        return a.y - b.y;
      });

      for (let i = 0; i < n; i++) {
        const p = sortedPoints[i];
        const slopes: number[] = [];

        const slopesSorted = mergeSort(sortedPoints.slice(i + 1), (a, b) => {
          const slopeA = p.slopeTo(a);
          const slopeB = p.slopeTo(b);
          if (slopeA !== slopeB) return slopeA - slopeB;
          if (a.x !== b.x) return a.x - b.x;
          return a.y - b.y;
        });

        let j = 0;
        while (j < slopesSorted.length) {
          let count = 1;
          const slope = p.slopeTo(slopesSorted[j]);

          while (
            j + count < slopesSorted.length &&
            p.slopeTo(slopesSorted[j + count]) === slope
          ) {
            count++;
          }

          if (count >= 3 && slopes.indexOf(slope) === -1) {
            this.segmentsArray.push(
              new LineSegment(p, slopesSorted[j + count - 1])
            );
            slopes.push(slope);
          }

          j += count;
        }
      }
      console.timeEnd("Points");
    }
  }

  function mergeSort<T>(arr: T[], comparator: (a: T, b: T) => number): T[] {
    if (arr.length <= 1) {
      return arr;
    }

    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    return merge(
      mergeSort(left, comparator),
      mergeSort(right, comparator),
      comparator
    );
  }

  function merge<T>(
    left: T[],
    right: T[],
    comparator: (a: T, b: T) => number
  ): T[] {
    let result: T[] = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (comparator(left[leftIndex], right[rightIndex]) <= 0) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }

    while (leftIndex < left.length) {
      result.push(left[leftIndex]);
      leftIndex++;
    }

    while (rightIndex < right.length) {
      result.push(right[rightIndex]);
      rightIndex++;
    }

    return result;
  }

  // Declare your point objects here~
  // const point = new Point(19000, 10000);
  // const point2 = new Point(10000, 10000);

  // from input6.txt

  const points: Point[] = [
    new Point(16454, 121),
    new Point(16507, 473),
    new Point(16560, 825),
    new Point(16666, 1529),
    new Point(20396, 121),
    new Point(20555, 544),
    new Point(20714, 967),
    new Point(21032, 1813),
    new Point(19974, 124),
    new Point(19710, 528),
    new Point(19446, 932),
    new Point(18918, 1740),
    new Point(10681, 193),
    new Point(10470, 316),
    new Point(10259, 439),
    new Point(9837, 685),
    new Point(10928, 580),
    new Point(11175, 967),
    new Point(11669, 1741),
    new Point(15470, 332),
    new Point(15347, 1036),
    new Point(15224, 1740),
    new Point(14978, 3148),
    new Point(13570, 404),
    new Point(13323, 650),
    new Point(13076, 896),
    new Point(12582, 1388),
    new Point(27069, 421),
    new Point(26558, 861),
    new Point(25536, 1741),
    new Point(10048, 562),
    new Point(9503, 1143),
    new Point(9169, 1601),
    new Point(8501, 2517),
    new Point(24060, 896),
    new Point(23901, 1195),
    new Point(23742, 1494),
    new Point(23424, 2092),
    new Point(12829, 1142),
    new Point(16613, 1177),
    new Point(26047, 1301),
    new Point(19182, 1336),
    new Point(11422, 1354),
    new Point(20873, 1390),
    new Point(19000, 10000),
    new Point(18000, 10000),
    new Point(32000, 10000),
    new Point(21000, 10000),
    new Point(1234, 5678),
    new Point(14000, 10000),
    new Point(1000, 1000),
    new Point(11000, 1000),
    new Point(13200, 1000),
    new Point(17700, 1000),
    new Point(32000, 1000),
    new Point(25000, 1000),
    new Point(28000, 1000),
    new Point(30000, 1000),
    new Point(31000, 1000),
    new Point(33000, 1000),
    new Point(35000, 1000),
    new Point(37000, 1000),
    new Point(39000, 1000),
    new Point(41000, 1000),
    new Point(43000, 1000),
    new Point(45000, 1000),
    new Point(47000, 1000),
    new Point(49000, 1000),
    new Point(51000, 1000),
    new Point(53000, 1000),
    new Point(55000, 1000),
    new Point(57000, 1000),
    new Point(59000, 1000),
    new Point(61000, 1000),
    new Point(63000, 1000),
    new Point(65000, 1000),
    new Point(1000, 2000),
    new Point(2000, 3000),
    new Point(3000, 4000),
    new Point(4000, 5000),
    new Point(5000, 6000),
    new Point(6000, 7000),
    new Point(7000, 8000),
    new Point(8000, 9000),
    new Point(9000, 10000),
    new Point(10000, 11000),
    new Point(11000, 12000),
    new Point(12000, 13000),
    new Point(13000, 14000),
    new Point(14000, 15000),
    new Point(15000, 16000),
    new Point(16000, 17000),
    new Point(17000, 18000),
    new Point(18000, 19000),
    new Point(19000, 20000),
    new Point(20000, 21000),
    new Point(21000, 22000),
    new Point(22000, 23000),
    new Point(23000, 24000),
    new Point(24000, 25000),
    new Point(25000, 26000),
    new Point(26000, 27000),
    new Point(27000, 28000),
    new Point(28000, 29000),
    new Point(29000, 30000),
    new Point(30000, 31000),
    new Point(31000, 32000),
    new Point(32000, 33000),
    new Point(33000, 34000),
    new Point(34000, 35000),
    new Point(35000, 36000),
    new Point(36000, 37000),
    new Point(37000, 38000),
    new Point(38000, 39000),
    new Point(39000, 40000),
    new Point(40000, 41000),
    new Point(41000, 42000),
    new Point(42000, 43000),
    new Point(43000, 44000),
    new Point(44000, 45000),
    new Point(45000, 46000),
    new Point(46000, 47000),
    new Point(47000, 48000),
    new Point(48000, 49000),
    new Point(49000, 50000),
    new Point(50000, 51000),
    new Point(51000, 52000),
    new Point(52000, 53000),
    new Point(53000, 54000),
    new Point(54000, 55000),
    new Point(55000, 56000),
    new Point(56000, 57000),
    new Point(57000, 58000),
    new Point(58000, 59000),
    new Point(59000, 60000),
    new Point(60000, 61000),
    new Point(61000, 62000),
    new Point(62000, 63000),
    new Point(63000, 64000),
    new Point(64000, 65000),
    new Point(65000, 66000),
    new Point(66000, 67000),
    new Point(73000, 74000),
    new Point(74000, 75000),
    new Point(75000, 76000),
    new Point(76000, 77000),
    new Point(77000, 78000),
    new Point(78000, 79000),
    new Point(79000, 80000),
    new Point(80000, 81000),
    new Point(81000, 82000),
    new Point(82000, 83000),
    new Point(83000, 84000),
    new Point(84000, 85000),
    new Point(85000, 86000),
    new Point(86000, 87000),
  ];

  p.draw = function () {
    p.translate(padding, height - padding);
    p.scale(1 / 100, -1 / 100);

    // point.draw();
    // point2.draw();
    // point.drawTo(point2);

    for (const point of points) {
      point.draw();
    }

    // const collinear = new BruteCollinearPoints(points);
    const collinear = new FastCollinearPoints(points);
    for (const segment of collinear.segments()) {
      segment.draw();
    }
  };
};

new p5(sketch);
