"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollationModule = void 0;
const common_1 = require("@nestjs/common");
const collation_common_module_1 = require("../../common/collation/collation-common.module");
const collation_controller_1 = require("./collation.controller");
const collation_service_1 = require("./collation.service");
const collation_browse_service_1 = require("./collation-browse.service");
let CollationModule = class CollationModule {
};
exports.CollationModule = CollationModule;
exports.CollationModule = CollationModule = __decorate([
    (0, common_1.Module)({
        imports: [collation_common_module_1.CollationCommonModule],
        controllers: [collation_controller_1.CollationController],
        providers: [collation_service_1.CollationService, collation_browse_service_1.CollationBrowseService],
        exports: [collation_service_1.CollationService, collation_browse_service_1.CollationBrowseService],
    })
], CollationModule);
//# sourceMappingURL=collation.module.js.map