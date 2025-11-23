"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DNSRecordType = exports.DomainStatus = exports.DomainType = void 0;
var DomainType;
(function (DomainType) {
    DomainType["SUBDOMAIN"] = "subdomain";
    DomainType["CUSTOM_DOMAIN"] = "custom_domain";
})(DomainType || (exports.DomainType = DomainType = {}));
var DomainStatus;
(function (DomainStatus) {
    DomainStatus["PENDING"] = "pending";
    DomainStatus["VERIFIED"] = "verified";
    DomainStatus["FAILED"] = "failed";
    DomainStatus["ACTIVE"] = "active";
    DomainStatus["INACTIVE"] = "inactive";
})(DomainStatus || (exports.DomainStatus = DomainStatus = {}));
var DNSRecordType;
(function (DNSRecordType) {
    DNSRecordType["A"] = "A";
    DNSRecordType["CNAME"] = "CNAME";
    DNSRecordType["TXT"] = "TXT";
})(DNSRecordType || (exports.DNSRecordType = DNSRecordType = {}));
//# sourceMappingURL=domain.types.js.map