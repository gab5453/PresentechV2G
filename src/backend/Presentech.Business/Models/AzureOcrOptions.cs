namespace Presentech.Business.Models
{
    public class AzureOcrOptions
    {
        public string Endpoint { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public string Model { get; set; } = "prebuilt-read";
        public string ApiVersion { get; set; } = "2024-11-30";
        public int MaxPollingAttempts { get; set; } = 12;
        public int PollingDelayMilliseconds { get; set; } = 1000;

        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(Endpoint) &&
            !string.IsNullOrWhiteSpace(Key);
    }
}
