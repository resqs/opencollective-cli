import { exec } from 'child_process';
import path from 'path';
import { expect } from 'chai';
import fs from 'fs';

var paths = {
  'package': path.resolve('test/package_with_postinstall'),
  'parentpackage': path.resolve('test/parentpackage'),
  'parentpackagejson': path.resolve('test/parentpackage/package.json'),
};

var originalParentPackageJSON = fs.readFileSync(paths.parentpackagejson, 'utf8');

describe("setup.test.js", function() {

  // restore the originals package.json
  after(function() {
    // fs.writeFileSync(paths.parentpackagejson, originalParentPackageJSON, "utf8");
  })

  it("runs the postinstall script after npm install", function(done) {
    this.timeout(10000);
    console.log(">>> cd", paths.package, "npm install");
    var proc = exec("npm install", { cwd: paths.package }, function(err, stdout, stderr) {
      stdout = stdout.toString('utf8');
      console.log("stdout", stdout);
      console.log("stderr", stderr);
      expect(stdout).to.contain("*** Thank you for using testpackage! ***");
      expect(stdout).to.contain("https://opencollective.com/testpackage/donate");
      done();
    });
  });

  it("installs a package that has opencollective-postinstall", function(done) {
    this.timeout(8000);
    console.log("Running","cross-env DEBUG=postinstall npm install --save " + paths.package);
    var proc = exec("cross-env DEBUG=postinstall npm install --save " + paths.package, { cwd: paths.parentpackage }, function(err, stdout, stderr) {
      stdout = stdout.toString('utf8');
      console.log("stdout", stdout);
      console.log("stderr", stderr);
      console.log("reading ", paths.parentpackagejson);
      var pkg = JSON.parse(fs.readFileSync(paths.parentpackagejson, 'utf8'));
      expect(pkg.dependencies).to.have.property("testpackage");
      expect(stdout).to.contain("https://opencollective.com/testpackage/donate");
      done();
    });
  });
});