"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveCollationResultDto = exports.RejectCollationResultDto = exports.AttachEc8aPhotoDto = exports.CreateCollationResultDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCollationResultDto {
    registeredVoters;
    accreditedVoters;
    votesCast;
    partyResults;
    ec8aPhotoUrls;
    static _OPENAPI_METADATA_FACTORY() {
        return { registeredVoters: { required: false, type: () => Number, minimum: 0 }, accreditedVoters: { required: false, type: () => Number, minimum: 0 }, votesCast: { required: false, type: () => Number, minimum: 0 }, partyResults: { required: false, type: "object", additionalProperties: { type: "number" } }, ec8aPhotoUrls: { required: false, type: () => [String] } };
    }
}
exports.CreateCollationResultDto = CreateCollationResultDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 850 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCollationResultDto.prototype, "registeredVoters", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 620 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCollationResultDto.prototype, "accreditedVoters", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 615 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCollationResultDto.prototype, "votesCast", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: { APC: 320, PDP: 210, NNPP: 85 },
        description: 'Party vote totals keyed by party code',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateCollationResultDto.prototype, "partyResults", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'URLs of uploaded EC8A form images — required before submission at PU level',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCollationResultDto.prototype, "ec8aPhotoUrls", void 0);
class AttachEc8aPhotoDto {
    photoUrl;
    static _OPENAPI_METADATA_FACTORY() {
        return { photoUrl: { required: true, type: () => String, minLength: 8 } };
    }
}
exports.AttachEc8aPhotoDto = AttachEc8aPhotoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'http://localhost:3001/uploads/abc.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], AttachEc8aPhotoDto.prototype, "photoUrl", void 0);
class RejectCollationResultDto {
    reason;
    static _OPENAPI_METADATA_FACTORY() {
        return { reason: { required: true, type: () => String } };
    }
}
exports.RejectCollationResultDto = RejectCollationResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Figures do not match signed EC8A form' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectCollationResultDto.prototype, "reason", void 0);
class ApproveCollationResultDto {
    comment;
    static _OPENAPI_METADATA_FACTORY() {
        return { comment: { required: false, type: () => String } };
    }
}
exports.ApproveCollationResultDto = ApproveCollationResultDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Figures verified against EC8A' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveCollationResultDto.prototype, "comment", void 0);
//# sourceMappingURL=collation.dto.js.map